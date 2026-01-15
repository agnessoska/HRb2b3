import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useHrProfile } from '@/shared/hooks/useHrProfile';
import { useOrganization } from '@/shared/hooks/useOrganization';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Plus,
  Send,
  MessageSquare,
  Bot,
  Sparkles,
  Copy,
  Paperclip,
  FileText,
  Loader2,
  X,
  History,
  ChevronRight,
  Trash2,
  Edit2,
  Check,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ru, enUS, kk } from 'date-fns/locale';
import { useAIAssistantStore } from '../hooks/useAIAssistantStore';
import {
  getConversations,
  getConversationMessages,
  createConversation,
  deleteConversation,
  updateConversationTitle
} from '../api/conversations';
import { sendMessageStream } from '../api/sendMessage';
import type { AIAssistantConversation, AIAssistantMessage, ContextType } from '../types';
import { cn } from '@/lib/utils';
import { supabase } from '@/shared/lib/supabase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';

export const AIAssistantDrawer = () => {
  const { t, i18n } = useTranslation(['ai-assistant', 'common']);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { data: hrProfile } = useHrProfile();
  const { data: organization } = useOrganization();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    currentConversationId, 
    messages, 
    isStreaming, 
    streamingText,
    isLoadingMessages,
    setCurrentConversation,
    setMessages,
    addMessage,
    setStreaming,
    appendStreamingText,
    setIsLoadingMessages,
    setStreamingText,
    setIsProcessingMessage
  } = useAIAssistantStore();

  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<AIAssistantConversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [attachment, setAttachment] = useState<{ url: string; name: string; type: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState('');
  const [focusedEntityName, setFocusedEntityName] = useState<string | null>(null);

  const currentLocale = i18n.language === 'kk' ? kk : i18n.language === 'en' ? enUS : ru;

  const getAutoContext = useCallback((): { type: ContextType; id?: string } => {
    const pathParts = location.pathname.split('/');
    if (pathParts.includes('vacancy')) {
      const idIndex = pathParts.indexOf('vacancy') + 1;
      const id = pathParts[idIndex];
      if (id && id !== 'profile') return { type: 'vacancy', id };
    }
    if (pathParts.includes('candidate')) {
      const idIndex = pathParts.indexOf('candidate') + 1;
      const id = pathParts[idIndex];
      if (id && id !== 'profile') return { type: 'candidate', id };
    }
    const ctxType = searchParams.get('context_type') as ContextType | null;
    const ctxId = searchParams.get('context_entity_id');
    if (ctxType && ctxId) return { type: ctxType, id: ctxId };
    return { type: 'global' };
  }, [location.pathname, searchParams]);

  const currentContext = useMemo(() => getAutoContext(), [getAutoContext]);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const loadMessages = useCallback(async (id: string, silent = false) => {
    try {
      if (!silent) setIsLoadingMessages(true);
      const data = await getConversationMessages(id);
      setMessages(data);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      if (!silent) setIsLoadingMessages(false);
    }
  }, [setMessages, setIsLoadingMessages]);

  const loadConversations = useCallback(async () => {
    if (!organization?.id) return;
    try {
      setIsLoadingConversations(true);
      const data = await getConversations(organization.id);
      setConversations(data);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [organization?.id]);

  useEffect(() => {
    const fetchFocusedEntityName = async () => {
      if (!isOpen || !organization?.id) return;
      if (currentContext.type === 'global' || !currentContext.id) {
        setFocusedEntityName(null);
        return;
      }

      try {
        if (currentContext.type === 'candidate') {
          const { data } = await supabase
            .from('candidates')
            .select('full_name')
            .eq('id', currentContext.id)
            .single();
          setFocusedEntityName(data?.full_name || null);
        } else if (currentContext.type === 'vacancy') {
          const { data } = await supabase
            .from('vacancies')
            .select('title')
            .eq('id', currentContext.id)
            .single();
          setFocusedEntityName(data?.title || null);
        }
      } catch (err) {
        console.error('Error fetching focused entity name:', err);
      }
    };

    fetchFocusedEntityName();
  }, [isOpen, organization?.id, currentContext]);

  useEffect(() => {
    if (isOpen && organization?.id) {
      loadConversations();
    }
  }, [isOpen, organization?.id, loadConversations]);

  useEffect(() => {
    if (currentConversationId) {
      loadMessages(currentConversationId, messages.length > 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentConversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText, scrollToBottom]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !organization?.id) return;

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${organization.id}/${fileName}`;

      const { error } = await supabase.storage
        .from('ai-assistant-attachments')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('ai-assistant-attachments')
        .getPublicUrl(filePath);

      setAttachment({
        url: publicUrl,
        name: file.name,
        type: file.type
      });
      toast.success(t('ai-assistant:fileUploaded'));
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(t('ai-assistant:errors.uploadFailed'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMessage = async (textOverride?: string) => {
    const messageContent = (textOverride || inputValue).trim();
    if ((!messageContent && !attachment) || isStreaming || !hrProfile || !organization) return;

    let convId = currentConversationId;
    const { type: context_type, id: context_entity_id } = currentContext;
    
    setIsProcessingMessage(true);

    if (!convId) {
      try {
        const newConv = await createConversation({
          organization_id: organization.id,
          hr_specialist_id: hrProfile.id,
          context_type,
          context_entity_id,
          title: messageContent.slice(0, 40) + (messageContent.length > 40 ? '...' : '')
        });
        setConversations(prev => [newConv, ...prev]);
        setCurrentConversation(newConv.id);
        convId = newConv.id;
      } catch (err) {
        console.error('Failed to create conversation:', err);
        setIsProcessingMessage(false);
        return;
      }
    }

    setInputValue('');
    setStreamingText('');
    
    const userMsgStub: AIAssistantMessage = {
      id: crypto.randomUUID(),
      conversation_id: convId,
      role: 'user',
      content: messageContent,
      created_at: new Date().toISOString(),
      tokens_used: 0,
      metadata: {},
      attachment_url: attachment?.url || null,
      attachment_name: attachment?.name || null,
      attachment_type: attachment?.type || null
    };
    addMessage(userMsgStub);
    setStreaming(true);
    
    const history = messages.slice(-10).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    await sendMessageStream(
      {
        organization_id: organization.id,
        hr_specialist_id: hrProfile.id,
        conversation_id: convId,
        message: messageContent,
        history,
        context_type,
        context_entity_id,
        language: i18n.language,
        attachment_url: attachment?.url,
        attachment_name: attachment?.name,
        attachment_type: attachment?.type
      },
      (delta) => appendStreamingText(delta),
      () => {
        const assistantMsg: AIAssistantMessage = {
          id: crypto.randomUUID(),
          conversation_id: convId!,
          role: 'assistant',
          content: useAIAssistantStore.getState().streamingText,
          created_at: new Date().toISOString(),
          tokens_used: 0,
          metadata: {},
          attachment_url: null,
          attachment_name: null,
          attachment_type: null
        };
        addMessage(assistantMsg);
        setStreaming(false);
        setStreamingText('');
        setAttachment(null);
        setIsProcessingMessage(false);
        if (convId) {
          loadMessages(convId, true);
        }
      },
      (error) => {
        setStreaming(false);
        setIsProcessingMessage(false);
        toast.error(error);
      }
    );
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success(t('common:copied'));
  };

  const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm(t('ai-assistant:confirmDelete') || 'Delete this chat?')) return;

    try {
      await deleteConversation(id);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (currentConversationId === id) {
        setCurrentConversation(null);
      }
      toast.success(t('ai-assistant:chatDeleted'));
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(t('ai-assistant:errors.deleteConversation'));
    }
  };

  const handleStartRename = (e: React.MouseEvent, conv: AIAssistantConversation) => {
    e.stopPropagation();
    setEditingConvId(conv.id);
    setEditTitleValue(conv.title || '');
  };

  const handleSaveRename = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!editingConvId || !editTitleValue.trim()) return;

    try {
      await updateConversationTitle(editingConvId, editTitleValue.trim());
      setConversations(prev => prev.map(c =>
        c.id === editingConvId ? { ...c, title: editTitleValue.trim() } : c
      ));
      setEditingConvId(null);
      toast.success(t('ai-assistant:titleUpdated'));
    } catch (err) {
      console.error('Rename error:', err);
      toast.error(t('ai-assistant:errors.updateTitle'));
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-6 right-6 h-16 w-16 rounded-3xl shadow-[0_20px_50px_rgba(139,92,246,0.3)] bg-gradient-to-br from-primary via-violet-600 to-indigo-600 text-white hover:scale-110 hover:-translate-y-1 transition-all duration-300 z-50 group border-4 border-white/10"
        >
          <Bot className="w-8 h-8 group-hover:rotate-12 transition-transform duration-300" />
          <div className="absolute inset-0 rounded-3xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-full rounded-l-[2.5rem] border-l border-border/50 bg-background/95 backdrop-blur-2xl shadow-2xl">
        <SheetHeader className="h-12 px-4 border-b border-border/50 bg-card/30 backdrop-blur-md shrink-0 justify-center">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <SheetTitle className="text-[13px] font-bold leading-none">{t('ai-assistant:assistantName')}</SheetTitle>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1 h-1 rounded-full bg-success animate-pulse" />
                  <span className="text-[9px] text-muted-foreground uppercase font-bold">Online</span>
                  {focusedEntityName && (
                    <>
                      <span className="text-muted-foreground mx-1 text-[9px]">•</span>
                      <div className="flex items-center gap-1 px-1 py-0.5 rounded bg-primary/10 text-primary">
                        <AlertCircle className="w-2 h-2" />
                        <span className="text-[8px] font-bold uppercase tracking-tight truncate max-w-[100px]">
                          {focusedEntityName}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setShowHistory(!showHistory)}>
                {showHistory ? <MessageSquare className="w-4 h-4" /> : <History className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => { setCurrentConversation(null); setShowHistory(false); }}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-hidden relative flex flex-col">
          {showHistory ? (
            <ScrollArea className="flex-1 p-4 bg-card/20">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 px-2">
                {t('ai-assistant:history')}
              </h3>
              <div className="space-y-2">
                {isLoadingConversations ? (
                  <div className="space-y-2">
                    <Skeleton className="h-16 w-full rounded-2xl" />
                    <Skeleton className="h-16 w-full rounded-2xl" />
                  </div>
                ) : conversations.map(conv => (
                  <div
                    key={conv.id}
                    onClick={() => {
                      if (editingConvId !== conv.id) {
                        setCurrentConversation(conv.id);
                        setShowHistory(false);
                      }
                    }}
                    className={cn(
                      "p-3 rounded-2xl cursor-pointer transition-all border group relative",
                      currentConversationId === conv.id ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20" : "hover:bg-accent/50 border-transparent"
                    )}
                  >
                    {editingConvId === conv.id ? (
                      <form onSubmit={handleSaveRename} className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <Input
                          autoFocus
                          value={editTitleValue}
                          onChange={(e) => setEditTitleValue(e.target.value)}
                          className="h-7 text-xs bg-background text-foreground"
                          onBlur={() => handleSaveRename()}
                        />
                        <Button size="icon" className="h-7 w-7 bg-success hover:bg-success/90 text-white" type="submit">
                          <Check className="w-3.5 h-3.5" />
                        </Button>
                      </form>
                    ) : (
                      <>
                        <div className="font-medium text-sm truncate pr-16">{conv.title || t('ai-assistant:untitled')}</div>
                        <div className="text-[10px] mt-1 opacity-70">
                          {format(new Date(conv.updated_at), 'PPP', { locale: currentLocale })}
                        </div>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-8 w-8 rounded-lg", currentConversationId === conv.id ? "hover:bg-primary-foreground/10 text-primary-foreground" : "hover:bg-background")}
                            onClick={(e) => handleStartRename(e, conv)}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-8 w-8 rounded-lg hover:text-destructive", currentConversationId === conv.id ? "hover:bg-primary-foreground/10 text-primary-foreground" : "hover:bg-background")}
                            onClick={(e) => handleDeleteConversation(e, conv.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <>
              <ScrollArea className="flex-1 p-4 md:p-6">
                <div className="space-y-6">
                  {messages.length === 0 && !isStreaming && !isLoadingMessages && (
                    <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in duration-500">
                      <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mb-4">
                        <Sparkles className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold mb-2">{t('ai-assistant:welcomeTitle')}</h3>
                      <p className="text-xs text-muted-foreground max-w-xs mb-4">{t('ai-assistant:welcomeDesc')}</p>
                      
                      <div className="w-full space-y-1.5">
                        {['q1', 'q2', 'q3', 'q4'].map((q) => (
                          <Button
                            key={q}
                            variant="outline"
                            className="w-full h-auto py-2 px-3.5 rounded-xl text-[10px] text-left justify-start border-primary/10 hover:bg-primary/10 transition-all group whitespace-normal bg-card/50"
                            onClick={() => handleSendMessage(t(`ai-assistant:suggestions.${currentContext.type}.${q}`))}
                          >
                            <span className="flex-1 line-clamp-2">{t(`ai-assistant:suggestions.${currentContext.type}.${q}`)}</span>
                            <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 text-primary" />
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {isLoadingMessages && messages.length === 0 ? (
                    <div className="space-y-4">
                      <Skeleton className="h-12 w-3/4 rounded-2xl" />
                      <Skeleton className="h-20 w-3/4 rounded-2xl ml-auto" />
                    </div>
                  ) : messages.map((msg) => (
                    <div key={msg.id} className={cn(
                      "flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300",
                      msg.role === 'user' ? "items-end" : "items-start"
                    )}>
                      <div className={cn(
                        "flex gap-3 max-w-full",
                        msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                      )}>
                        <div className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md overflow-hidden",
                          msg.role === 'user' ? "bg-white dark:bg-accent text-primary border" : "bg-gradient-to-br from-primary to-violet-600 text-white"
                        )}>
                          {msg.role === 'user' ? (
                            hrProfile?.avatar_url ? (
                              <img src={hrProfile.avatar_url} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <span className="text-[10px] font-bold">{hrProfile?.full_name?.charAt(0) || 'U'}</span>
                            )
                          ) : <Bot className="w-4 h-4" />}
                        </div>
                        <div className={cn(
                          "group/msg relative max-w-[85%] px-5 py-4 rounded-3xl text-[13px] leading-relaxed shadow-sm transition-all",
                          msg.role === 'user' ? "bg-primary text-primary-foreground rounded-tr-none shadow-xl shadow-primary/10" : "bg-card/50 border border-border/50 rounded-tl-none prose prose-slate dark:prose-invert max-w-none backdrop-blur-sm hover:bg-card/80"
                        )}>
                          {msg.attachment_url && (
                            <a href={msg.attachment_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 mb-2 p-2 rounded-lg bg-background/50 border border-border/50 text-[10px] hover:border-primary/30 transition-colors">
                              <FileText className="w-3 h-3 text-primary" />
                              <span className="truncate max-w-[120px] font-medium">{msg.attachment_name}</span>
                            </a>
                          )}
                          <div className="whitespace-pre-wrap">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                          </div>
                          {msg.role === 'assistant' && (
                            <Button 
                              variant="ghost" size="icon" 
                              className="absolute -right-8 top-0 opacity-0 group-hover/msg:opacity-100 transition-opacity h-7 w-7 hover:bg-primary/10 hover:text-primary"
                              onClick={() => handleCopyMessage(msg.content)}
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isStreaming && (
                    <div className="flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-violet-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="max-w-[85%] px-5 py-4 rounded-3xl bg-card/50 border border-border/50 rounded-tl-none text-[13px] leading-relaxed shadow-sm prose prose-slate dark:prose-invert max-w-none backdrop-blur-sm">
                        <div className="whitespace-pre-wrap">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamingText}</ReactMarkdown>
                        </div>
                        <span className="inline-block w-1.5 h-4 ml-1 bg-primary animate-pulse rounded-full align-middle" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-border/50 bg-card/30 backdrop-blur-lg">
                <div className="space-y-2">
                  {attachment && (
                    <div className="flex items-center gap-2 p-1.5 px-3 bg-primary/10 border border-primary/20 rounded-xl animate-in slide-in-from-bottom-1">
                      <div className="h-5 w-5 rounded-lg bg-primary/20 flex items-center justify-center">
                        <FileText className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-[10px] font-bold text-primary truncate flex-1">{attachment.name}</span>
                      <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full hover:bg-primary/20" onClick={() => setAttachment(null)}>
                        <X className="w-2.5 h-2.5 text-primary" />
                      </Button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                    <Button
                      variant="ghost" size="icon"
                      className="h-10 w-10 rounded-xl border border-border/50 hover:bg-accent/50 transition-all active:scale-90"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isStreaming || isUploading}
                    >
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
                    </Button>
                    <div className="relative flex-1">
                      <Input
                        placeholder={t('ai-assistant:inputPlaceholder')}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                        disabled={isStreaming}
                        className="h-10 rounded-xl pr-10 text-sm border-border/50 focus-visible:ring-primary/20 bg-background/50 backdrop-blur-sm"
                      />
                      <Button
                        size="icon"
                        onClick={() => handleSendMessage()}
                        disabled={(!inputValue.trim() && !attachment) || isStreaming}
                        className="absolute right-1.5 top-1.5 h-7 w-7 rounded-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-90"
                      >
                        <Send className="w-3.5 h-3.5 text-white" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
