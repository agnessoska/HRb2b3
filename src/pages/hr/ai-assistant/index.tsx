import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useHrProfile } from '@/shared/hooks/useHrProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  Send,
  MessageSquare,
  Trash2,
  History,
  Bot,
  Sparkles,
  ChevronLeft,
  Edit2,
  Check,
  X,
  Copy,
  Paperclip,
  FileText,
  Loader2,
  Cpu,
  Users,
  LayoutDashboard,
  Coins,
  Mic,
  ShieldCheck
} from 'lucide-react';
import { format } from 'date-fns';
import { ru, enUS, kk } from 'date-fns/locale';
import { useAIAssistantStore } from '@/features/ai-assistant/hooks/useAIAssistantStore';
import {
  getConversations,
  getConversationMessages,
  createConversation,
  deleteConversation,
  updateConversationTitle
} from '@/features/ai-assistant/api/conversations';
import { sendMessageStream } from '@/features/ai-assistant/api/sendMessage';
import type { AIAssistantConversation, AIAssistantMessage, ContextType } from '@/features/ai-assistant/types';
import { cn } from '@/lib/utils';
import { supabase } from '@/shared/lib/supabase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';
import { motion, type Variants } from 'framer-motion';
import { HelpCircle } from '@/shared/ui/HelpCircle';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4 }
  }
};

const AIAssistantPage = () => {
  const { t, i18n } = useTranslation(['ai-assistant', 'common']);
  const [searchParams] = useSearchParams();
  const { data: hrProfile } = useHrProfile();
  const queryClient = useQueryClient();
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
    setStreamingText,
    appendStreamingText,
    setIsLoadingMessages,
    setIsProcessingMessage
  } = useAIAssistantStore();

  const [conversations, setConversations] = useState<AIAssistantConversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [attachment, setAttachment] = useState<{ url: string; name: string; type: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const currentLocale = i18n.language === 'kk' ? kk : i18n.language === 'en' ? enUS : ru;

  const totalTokensUsed = useMemo(() => {
    return messages.reduce((sum, msg) => sum + (msg.tokens_used || 0), 0);
  }, [messages]);

  const formatTokens = (count: number) => {
    return new Intl.NumberFormat(i18n.language === 'en' ? 'en-US' : 'ru-RU').format(count);
  };

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (!shouldAutoScroll && behavior === 'smooth') return;
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, [shouldAutoScroll]);

  // Handle manual scroll to toggle auto-scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 100;
    setShouldAutoScroll(isAtBottom);
  }, []);

  const loadMessages = useCallback(async (id: string) => {
    try {
      setIsLoadingMessages(true);
      const data = await getConversationMessages(id);
      setMessages(data);
    } catch (err) {
      console.error('Failed to load messages:', err);
      toast.error(t('ai-assistant:errors.loadMessages'));
    } finally {
      setIsLoadingMessages(false);
    }
  }, [setMessages, t, setIsLoadingMessages]);

  const loadConversations = useCallback(async (ctxType?: ContextType | null, ctxId?: string | null) => {
    if (!hrProfile?.organization_id) return;
    try {
      setIsLoadingConversations(true);
      const data = await getConversations(hrProfile.organization_id);
      setConversations(data);

      if (ctxType && ctxId) {
        const existing = data.find(c => c.context_type === ctxType && c.context_entity_id === ctxId);
        if (existing) {
          setCurrentConversation(existing.id);
        } else {
          const newConv = await createConversation({
            organization_id: hrProfile.organization_id,
            hr_specialist_id: hrProfile.id,
            context_type: ctxType,
            context_entity_id: ctxId,
            title: t('ai-assistant:newChatTitle')
          });
          setConversations([newConv, ...data]);
          setCurrentConversation(newConv.id);
        }
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
      toast.error(t('ai-assistant:errors.loadConversations'));
    } finally {
      setIsLoadingConversations(false);
    }
  }, [hrProfile, setCurrentConversation, t]);

  useEffect(() => {
    if (hrProfile?.organization_id) {
      const contextType = searchParams.get('context_type') as ContextType | null;
      const contextEntityId = searchParams.get('context_entity_id');
      
      loadConversations(contextType, contextEntityId);
    }
  }, [hrProfile?.organization_id, searchParams, loadConversations]);

  useEffect(() => {
    if (currentConversationId) {
      loadMessages(currentConversationId);
      
      // Auto-close sidebar on mobile when chat is selected
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentConversationId]);

  useEffect(() => {
    // Use instant scroll during streaming to prevent jitter
    // Use smooth scroll for new full messages
    const behavior = isStreaming ? 'auto' : 'smooth';
    scrollToBottom(behavior);
  }, [messages, streamingText, isStreaming, scrollToBottom]);

  const handleCreateNewChat = async () => {
    if (!hrProfile) return;
    try {
      const newConv = await createConversation({
        organization_id: hrProfile.organization_id,
        hr_specialist_id: hrProfile.id,
        context_type: 'global',
        title: t('ai-assistant:newChatTitle')
      });
      setConversations([newConv, ...conversations]);
      setCurrentConversation(newConv.id);
    } catch (err) {
      console.error('Failed to create conversation:', err);
      toast.error(t('ai-assistant:errors.createConversation'));
    }
  };

  const handleDeleteChat = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteConversation(id);
      setConversations(conversations.filter(c => c.id !== id));
      if (currentConversationId === id) {
        setCurrentConversation(null);
      }
      toast.success(t('ai-assistant:chatDeleted'));
    } catch (err) {
      console.error('Failed to delete conversation:', err);
      toast.error(t('ai-assistant:errors.deleteConversation'));
    }
  };

  const handleStartEditing = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    setEditingConvId(id);
    setEditTitleValue(title || t('ai-assistant:untitled'));
  };

  const handleSaveTitle = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await updateConversationTitle(id, editTitleValue);
      setConversations(conversations.map(c => c.id === id ? { ...c, title: editTitleValue } : c));
      setEditingConvId(null);
      toast.success(t('ai-assistant:titleUpdated'));
    } catch (err) {
      console.error('Failed to update title:', err);
      toast.error(t('ai-assistant:errors.updateTitle'));
    }
  };

  const handleCancelEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingConvId(null);
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success(t('common:copied'));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !hrProfile?.organization_id) return;

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${hrProfile.organization_id}/${fileName}`;

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

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && !attachment) || isStreaming || !hrProfile) return;

    let convId = currentConversationId;
    const userMessageContent = inputValue.trim();
    setInputValue('');
    setIsProcessingMessage(true);
    
    if (!convId) {
      try {
        const newConv = await createConversation({
          organization_id: hrProfile.organization_id,
          hr_specialist_id: hrProfile.id,
          context_type: 'global',
          title: userMessageContent.slice(0, 30) + (userMessageContent.length > 30 ? '...' : '')
        });
        setConversations([newConv, ...conversations]);
        setCurrentConversation(newConv.id);
        convId = newConv.id;
      } catch (err) {
        console.error('Failed to create conversation:', err);
        toast.error(t('ai-assistant:errors.createConversation'));
        setIsProcessingMessage(false);
        return;
      }
    }

    const context_type = (searchParams.get('context_type') as ContextType) || 'global';
    const context_entity_id = searchParams.get('context_entity_id') || undefined;
    
    const userMsgStub: AIAssistantMessage = {
      id: crypto.randomUUID(),
      conversation_id: convId,
      role: 'user',
      content: userMessageContent,
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
        organization_id: hrProfile.organization_id,
        hr_specialist_id: hrProfile.id,
        conversation_id: convId,
        message: userMessageContent,
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
          loadMessages(convId);
          // Invalidate organization queries to update balance in real-time
          useAIAssistantStore.getState().setStreaming(false); // Just to be sure
          queryClient.invalidateQueries({ queryKey: ['organization'] });
        }
      },
      (error) => {
        setStreaming(false);
        setIsProcessingMessage(false);
        toast.error(error);
      }
    );
  };

  return (
    <div className="flex h-[calc(100vh-120px)] overflow-hidden gap-4">
      <div className={cn(
        "flex flex-col bg-card/60 backdrop-blur-md border rounded-3xl transition-all duration-300",
        isSidebarOpen ? "w-full md:w-80" : "w-0 overflow-hidden border-none"
      )}>
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold px-2">
            <History className="w-5 h-5 text-primary" />
            <span>{t('ai-assistant:history')}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleCreateNewChat} className="rounded-full hover:bg-primary/10">
            <Plus className="w-5 h-5" />
          </Button>
        </div>
        <Separator className="bg-border/50" />
        <ScrollArea className="flex-1 px-2">
          <div className="py-4 space-y-1">
            {isLoadingConversations ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-3">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))
            ) : conversations.length === 0 ? (
              <div className="text-center py-10 px-4 text-muted-foreground text-sm">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p>{t('ai-assistant:noHistory')}</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setCurrentConversation(conv.id)}
                  className={cn(
                    "group relative p-3 rounded-2xl cursor-pointer transition-all duration-200",
                    currentConversationId === conv.id 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                      : "hover:bg-accent/50"
                  )}
                >
                  {editingConvId === conv.id ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={editTitleValue}
                        onChange={(e) => setEditTitleValue(e.target.value)}
                        className="h-7 text-xs bg-background text-foreground rounded-lg"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full text-white" onClick={(e) => handleSaveTitle(e, conv.id)}>
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full text-white" onClick={handleCancelEditing}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="font-medium text-sm truncate pr-14">
                        {conv.title || t('ai-assistant:untitled')}
                      </div>
                      <div className={cn(
                        "text-[10px] mt-1 opacity-70",
                        currentConversationId === conv.id ? "text-primary-foreground" : "text-muted-foreground"
                      )}>
                        {format(new Date(conv.updated_at), 'PPP', { locale: currentLocale })}
                      </div>
                      <div className={cn(
                        "absolute right-1 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity",
                        editingConvId === conv.id && "opacity-100"
                      )}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleStartEditing(e, conv.id, conv.title || '')}
                          className={cn(
                            "h-8 w-8 rounded-full",
                            currentConversationId === conv.id ? "hover:bg-white/20 text-white" : "hover:bg-primary/10 text-primary"
                          )}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDeleteChat(e, conv.id)}
                          className={cn(
                            "h-8 w-8 rounded-full",
                            currentConversationId === conv.id ? "hover:bg-white/20 text-white" : "hover:bg-destructive/10 text-destructive"
                          )}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <div className={cn(
        "flex-1 flex flex-col bg-card/40 backdrop-blur-sm border rounded-3xl overflow-hidden relative",
        isSidebarOpen && "hidden md:flex"
      )}>
        <div className="p-4 border-b bg-card/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="rounded-full"
            >
              {isSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <History className="w-5 h-5" />}
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <Bot className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2">
                <div>
                  <h2 className="font-bold text-sm tracking-tight">{t('ai-assistant:assistantName')}</h2>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Online</span>
                  </div>
                </div>
                <HelpCircle topicId="ai_assistant_tools" iconClassName="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-3">
             {totalTokensUsed > 0 && (
               <div className="px-3 py-1.5 rounded-full bg-muted border flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                 <Cpu className="w-3.5 h-3.5 text-muted-foreground" />
                 <span className="text-[11px] font-medium text-muted-foreground">
                   {t('ai-assistant:totalUsage')}: {formatTokens(totalTokensUsed)}
                 </span>
               </div>
             )}
             <div className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] font-medium text-primary">Advanced HR Intelligence</span>
             </div>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4 md:p-6" onScrollCapture={handleScroll}>
          <div className="max-w-3xl mx-auto space-y-6 pb-4">
            {messages.length === 0 && !isStreaming && !isLoadingMessages && (
              <motion.div
                className="flex flex-col items-center justify-start pt-4 md:pt-8 text-center max-w-7xl mx-auto w-full"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={itemVariants} className="w-full mb-10">
                  <div className="flex flex-wrap justify-center gap-6 px-4 max-w-6xl mx-auto">
                    {[
                      { icon: LayoutDashboard, title: 'vacancies', color: 'text-blue-500' },
                      { icon: Users, title: 'candidates', color: 'text-emerald-500' },
                      { icon: Mic, title: 'interviews', color: 'text-violet-500' },
                      { icon: FileText, title: 'multimodal', color: 'text-orange-500' },
                      { icon: ShieldCheck, title: 'culture', color: 'text-pink-500' }
                    ].map((cap) => (
                      <div
                        key={cap.title}
                        className="group w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.33%-16px)] p-8 rounded-[32px] bg-card/20 border border-primary/5 flex flex-col items-center lg:items-start text-center lg:text-left transition-all duration-300 hover:bg-card/40 hover:border-primary/10 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1.5"
                      >
                        <div className={cn("w-16 h-14 rounded-2xl bg-background shadow-sm flex items-center justify-center mb-6 border border-primary/5 transition-transform duration-300 group-hover:scale-110", cap.color)}>
                          <cap.icon className="w-7 h-7" />
                        </div>
                        <h5 className="font-bold text-lg mb-3 leading-tight tracking-tight">{t(`ai-assistant:capabilities.${cap.title}`)}</h5>
                        <p className="text-[13px] text-muted-foreground leading-relaxed font-medium opacity-80">
                          {t(`ai-assistant:capabilities.${cap.title}Desc`)}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="mb-12">
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400 text-[11px] font-bold shadow-sm">
                    <Coins className="w-4 h-4" />
                    {t('ai-assistant:tokenWarning')}
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mx-auto px-4 md:px-0">
                    {['q1', 'q2', 'q3', 'q4'].map((q) => {
                      const ctx = (searchParams.get('context_type') as ContextType) || 'global';
                      return (
                        <Button
                          key={q}
                          variant="ghost"
                          className="h-auto py-4 px-5 rounded-2xl text-xs text-left justify-start border bg-card/30 hover:bg-primary/5 hover:border-primary/30 transition-all whitespace-normal shadow-sm group"
                          onClick={() => {
                            setInputValue(t(`ai-assistant:suggestions.${ctx}.${q}`));
                          }}
                        >
                          <div className="w-8 h-8 rounded-lg bg-background/50 flex items-center justify-center mr-3 border group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <Sparkles className="w-3.5 h-3.5" />
                          </div>
                          <span className="line-clamp-2 flex-1 font-medium">{t(`ai-assistant:suggestions.${ctx}.${q}`)}</span>
                        </Button>
                      );
                    })}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {isLoadingMessages && messages.length === 0 ? (
              <div className="space-y-6">
                {[1, 2].map((i) => (
                  <div key={i} className={cn("flex gap-3", i % 2 === 0 ? "flex-row-reverse" : "")}>
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="h-20 w-2/3 rounded-2xl" />
                  </div>
                ))}
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={cn(
                  "flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300",
                  msg.role === 'user' ? "items-end" : "items-start"
                )}>
                  <div className={cn(
                    "flex gap-3 max-w-full",
                    msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                  )}>
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm",
                      msg.role === 'user' ? "bg-accent" : "bg-primary text-primary-foreground"
                    )}>
                      {msg.role === 'user' ? (
                        <span className="text-[10px] font-bold">{hrProfile?.full_name?.[0] || 'U'}</span>
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                    <div className={cn(
                      "group/msg relative max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                      msg.role === 'user' 
                        ? "bg-primary text-primary-foreground rounded-tr-none" 
                        : "bg-background border rounded-tl-none prose prose-slate dark:prose-invert max-w-none"
                    )}>
                      {msg.attachment_url && (
                        <a 
                          href={msg.attachment_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className={cn(
                            "flex items-center gap-2 mb-2 p-2 rounded-xl border transition-colors",
                            msg.role === 'user' ? "bg-white/10 border-white/20 hover:bg-white/20" : "bg-muted hover:bg-muted/80"
                          )}
                        >
                          <FileText className="w-4 h-4" />
                          <span className="text-xs truncate max-w-[150px]">{msg.attachment_name}</span>
                        </a>
                      )}
                      {msg.role === 'assistant' ? (
                        <>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopyMessage(msg.content)}
                            className="absolute -right-10 top-0 opacity-0 group-hover/msg:opacity-100 transition-opacity h-8 w-8 rounded-full hover:bg-primary/10 text-muted-foreground"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      ) : (
                        msg.content
                      )}
                      
                      {msg.role === 'assistant' && (msg.tokens_used ?? 0) > 0 && (
                        <div className="mt-2 flex items-center justify-end gap-1.5 opacity-40 group-hover/msg:opacity-100 transition-opacity">
                          <Cpu className="w-3 h-3" />
                          <span className="text-[10px] font-medium tracking-tight">
                            {formatTokens(msg.tokens_used ?? 0)} tokens
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}

            {isStreaming && (
              <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="max-w-[85%] px-4 py-3 rounded-2xl bg-background border rounded-tl-none text-sm leading-relaxed shadow-sm prose prose-slate dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {streamingText}
                  </ReactMarkdown>
                  <span className="inline-block w-1.5 h-4 ml-1 bg-primary animate-pulse align-middle" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-4 md:p-6 bg-card/40 border-t">
          <div className="max-w-3xl mx-auto space-y-3">
            {attachment && (
              <div className="flex items-center gap-2 p-2 px-3 bg-primary/5 border border-primary/20 rounded-2xl animate-in fade-in zoom-in duration-200">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-primary truncate max-w-[200px]">{attachment.name}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-primary/10" onClick={() => setAttachment(null)}>
                  <X className="w-3 h-3 text-primary" />
                </Button>
              </div>
            )}
            <div className="flex gap-3">
              <div className="relative flex-1 flex gap-2">
                <input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-14 w-14 rounded-2xl border border-primary/10 hover:bg-primary/5 flex-shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isStreaming || isUploading}
                >
                  {isUploading ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : <Paperclip className="w-5 h-5 text-primary" />}
                </Button>
                <Input
                  placeholder={t('ai-assistant:inputPlaceholder')}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  disabled={isStreaming}
                  className="h-14 rounded-2xl pr-14 border-primary/20 focus-visible:ring-primary/30"
                />
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={(!inputValue.trim() && !attachment) || isStreaming}
                  className="absolute right-2 top-2 h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-center text-muted-foreground mt-3 uppercase tracking-widest font-medium opacity-50">
            {t('ai-assistant:disclaimer')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPage;