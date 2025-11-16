export const ChatSkeleton = () => {
  return (
    <div className="h-full flex">
      <div className="w-[30%] border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="h-7 w-32 bg-muted rounded-md mb-3" />
          <div className="h-9 w-full bg-muted rounded-md" />
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <div className="w-10 h-10 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-muted rounded-md" />
                <div className="h-3 w-1/2 bg-muted rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="border-b p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-48 bg-muted rounded-md" />
            </div>
          </div>
        </div>
        <div className="flex-1 p-4" />
        <div className="border-t p-4">
          <div className="h-9 w-full bg-muted rounded-md" />
        </div>
      </div>
    </div>
  );
};
