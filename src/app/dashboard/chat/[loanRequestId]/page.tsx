'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import { ChatInterface } from '@/features/chat/ChatInterface';
import useAxios from '@/hooks/use-axios';
import { useLoanRequestDetail } from '@/features/loan-requests/api/loan-request-service';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useChat } from '@/features/chat/ChatContext';

export default function ChatPage() {
  const router = useRouter();
  const { loanRequestId } = useParams();
  const apiClient = useAxios();
  const { markMessagesAsRead } = useChat();

  const {
    data: loanRequestDetail,
    isLoading,
    error
  } = useLoanRequestDetail(apiClient!, loanRequestId as string);
  const [title, setTitle] = useState('Chat de solicitud');

  useEffect(() => {
    if (loanRequestDetail) {
      // Set the title with customer information if available
      if (loanRequestDetail.client) {
        setTitle(`Chat: ${loanRequestDetail.client.name}`);
      } else {
        setTitle(`Chat: Solicitud #${loanRequestId}`);
      }
    }
  }, [loanRequestDetail, loanRequestId]);

  useEffect(() => {
    if (loanRequestId) {
      console.log('Marking messages as read for loan request:', loanRequestId);
      markMessagesAsRead(loanRequestId as string);
    }
  }, [loanRequestId, markMessagesAsRead]);

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className='flex flex-1 flex-col space-y-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <Button variant='outline' size='icon' onClick={handleBack}>
                <ArrowLeft className='h-4 w-4' />
              </Button>
              <Heading
                title='Chat de solicitud'
                description='Cargando información...'
              />
            </div>
          </div>

          <Separator />

          <div className='flex flex-col gap-4'>
            <Skeleton className='h-12 w-full rounded-lg' />
            <Skeleton className='h-[500px] w-full rounded-lg' />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error || !loanRequestDetail) {
    return (
      <PageContainer>
        <div className='flex flex-1 flex-col space-y-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <Button variant='outline' size='icon' onClick={handleBack}>
                <ArrowLeft className='h-4 w-4' />
              </Button>
              <Heading
                title='Chat de solicitud'
                description='Error al cargar'
              />
            </div>
          </div>

          <Separator />

          <Alert variant='destructive'>
            <AlertTitle>Error al cargar el chat</AlertTitle>
            <AlertDescription>
              {typeof error === 'string'
                ? error
                : 'No se pudo encontrar la solicitud especificada'}
            </AlertDescription>
          </Alert>
          <div className='flex justify-center'>
            <Button onClick={handleBack} variant='default'>
              Volver
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Button variant='outline' size='icon' onClick={handleBack}>
              <ArrowLeft className='h-4 w-4' />
            </Button>
            <Heading
              title={title}
              description='Comunicación sobre la solicitud'
            />
          </div>
          <div className='flex items-center gap-2'>
            <Badge variant='outline'>
              Estado: {loanRequestDetail.loanRequest.status}
            </Badge>
            <Button
              variant='outline'
              onClick={() =>
                router.push(`/dashboard/loan-requests/${loanRequestId}`)
              }
            >
              Ver solicitud
            </Button>
          </div>
        </div>

        <Separator />

        <div className='h-[calc(100vh-200px)]'>
          <ChatInterface
            loanRequestId={loanRequestId as string}
            title={title}
            className='h-full'
          />
        </div>
      </div>
    </PageContainer>
  );
}
