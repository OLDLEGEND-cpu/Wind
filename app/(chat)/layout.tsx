import AuthProvider from '@/components/layout/AuthProvider';
import ToastProvider from '@/components/ui/Toast';
import ChatShell from '@/components/chat/ChatShell';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <ChatShell>{children}</ChatShell>
      </ToastProvider>
    </AuthProvider>
  );
}
