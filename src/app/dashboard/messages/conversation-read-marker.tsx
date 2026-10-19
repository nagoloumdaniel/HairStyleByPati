'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { adminMarkConversationRead } from '@/modules/messagerie/actions';

/* Marque les messages cliente comme lus à l'ouverture de la conversation. */
export function ConversationReadMarker({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const formData = new FormData();
    formData.set('conversationId', conversationId);
    void adminMarkConversationRead(formData).then(() => router.refresh());
  }, [conversationId, router]);

  return null;
}
