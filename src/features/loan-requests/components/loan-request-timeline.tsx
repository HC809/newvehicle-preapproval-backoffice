import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { LoanRequestEvent } from 'types/LoanRequestEvent';
import { LoanRequestStatus } from 'types/LoanRequests';
import {
  History,
  Calculator,
  FileText,
  FileX,
  AlertCircle,
  CircleDot,
  CreditCard,
  Building2,
  Clock,
  User,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { translateStatus } from '@/utils/getStatusColor';

interface LoanRequestTimelineProps {
  isOpen: boolean;
  onClose: () => void;
  events: LoanRequestEvent[];
}

const getEventTypeTranslation = (eventType: string) => {
  switch (eventType) {
    case 'StatusChanged':
      return 'Cambio de Estado';
    case 'EquifaxVerification':
      return 'Consulta de Equifax';
    case 'BantotalVerification':
      return 'Consulta en Bantotal';
    case 'FinantialCalculation':
      return 'Cálculo Financiero';
    case 'FileUploaded':
      return 'Subida de Documento';
    case 'FileDeleted':
      return 'Documento Eliminado';
    default:
      return eventType;
  }
};

const getEventIcon = (eventType: string) => {
  switch (eventType) {
    case 'StatusChanged':
      return <History className='h-4 w-4' />;
    case 'EquifaxVerification':
      return <CreditCard className='h-4 w-4' />;
    case 'BantotalVerification':
      return <Building2 className='h-4 w-4' />;
    case 'FinantialCalculation':
      return <Calculator className='h-4 w-4' />;
    case 'FileUploaded':
      return <FileText className='h-4 w-4' />;
    case 'FileDeleted':
      return <FileX className='h-4 w-4' />;
    default:
      return <AlertCircle className='h-4 w-4' />;
  }
};

const getEventColor = (eventType: string) => {
  switch (eventType) {
    case 'StatusChanged':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50';
    case 'EquifaxVerification':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50';
    case 'BantotalVerification':
      return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50';
    case 'FinantialCalculation':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50';
    case 'FileUploaded':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50';
    case 'FileDeleted':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700';
  }
};

export function LoanRequestTimeline({
  isOpen,
  onClose,
  events
}: LoanRequestTimelineProps) {
  // Sort events by timestamp in descending order (newest first)
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Group events by date
  const groupedEvents = sortedEvents.reduce(
    (groups, event) => {
      const date = format(new Date(event.timestamp), 'PPP', { locale: es });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(event);
      return groups;
    },
    {} as Record<string, LoanRequestEvent[]>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <History className='h-5 w-5 text-primary' />
            Historial de Eventos
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className='h-[500px] pr-4'>
          <div className='relative space-y-8'>
            {/* Timeline line */}
            <div className='absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-primary/20 dark:bg-primary/10' />

            {Object.entries(groupedEvents).map(([date, dateEvents]) => {
              // Track the event index for alternating sides within this date group
              let eventIndex = 0;

              return (
                <div key={date} className='space-y-6'>
                  <div className='sticky top-0 z-10 -mx-4 mb-4 bg-primary-foreground px-4 py-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-primary-foreground/90'>
                    <h3 className='flex items-center gap-2 text-base font-semibold text-primary'>
                      <Calendar className='h-4 w-4' />
                      {date}
                    </h3>
                  </div>

                  {dateEvents.map((event) => {
                    // Simple alternating pattern: even indexes on left, odd on right
                    const isLeft = eventIndex % 2 === 0;
                    eventIndex++;

                    return (
                      <div
                        key={event.id}
                        className={cn(
                          'relative flex w-full items-start gap-4',
                          isLeft ? 'justify-start' : 'justify-end'
                        )}
                      >
                        {/* Timeline dot and line */}
                        <div
                          className={cn(
                            'absolute top-4 h-2 w-2 rounded-full bg-primary/20 dark:bg-primary/10',
                            isLeft
                              ? 'left-1/2 -translate-x-1/2'
                              : 'right-1/2 translate-x-1/2'
                          )}
                        />

                        {/* Event card */}
                        <div
                          className={cn(
                            'relative flex w-[calc(50%-2rem)] gap-4 rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md dark:border-border/50',
                            isLeft ? 'flex-row' : 'flex-row-reverse'
                          )}
                        >
                          <div
                            className={cn(
                              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/5',
                              getEventColor(event.eventType)
                            )}
                          >
                            {getEventIcon(event.eventType)}
                          </div>

                          <div className='flex flex-1 flex-col gap-2'>
                            {/* User and time info */}
                            <div className='flex items-center justify-between'>
                              <div className='flex items-center gap-2'>
                                <div className='flex items-center gap-1.5'>
                                  <User className='h-4 w-4 text-muted-foreground' />
                                  <span className='max-w-[200px] truncate font-medium'>
                                    {event.userName}
                                  </span>
                                </div>
                              </div>
                              <div className='flex items-center gap-1 rounded-md bg-muted/50 px-2 py-1 text-xs text-muted-foreground'>
                                <Clock className='h-3.5 w-3.5' />
                                {format(new Date(event.timestamp), 'p', {
                                  locale: es
                                })}
                              </div>
                            </div>

                            {/* Event type badge */}
                            <Badge
                              variant='secondary'
                              className={cn(
                                'w-fit shrink-0',
                                getEventColor(event.eventType)
                              )}
                            >
                              {getEventTypeTranslation(event.eventType)}
                            </Badge>

                            {/* Event comment */}
                            <p className='text-sm text-muted-foreground'>
                              {event.comment}
                            </p>

                            {/* Status changes */}
                            {event.previousStatus && event.newStatus && (
                              <div className='flex items-center gap-2 text-sm'>
                                <span className='text-muted-foreground'>
                                  Estado:
                                </span>
                                <div className='flex items-center gap-1'>
                                  {event.newStatus !==
                                    LoanRequestStatus.Pending && (
                                    <>
                                      <span className='font-medium text-red-500 dark:text-red-400'>
                                        {translateStatus(
                                          event.previousStatus as LoanRequestStatus
                                        )}
                                      </span>
                                      <CircleDot className='h-3 w-3 text-muted-foreground' />
                                    </>
                                  )}
                                  <span
                                    className={cn(
                                      'font-medium',
                                      event.newStatus ===
                                        LoanRequestStatus.Pending
                                        ? 'text-yellow-600 dark:text-yellow-400'
                                        : 'text-green-500 dark:text-green-400'
                                    )}
                                  >
                                    {translateStatus(
                                      event.newStatus as LoanRequestStatus
                                    )}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
