import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText } from 'lucide-react';

interface CommentCardProps {
  comment: string | null;
}

export const CommentCard = ({ comment }: CommentCardProps) => {
  if (!comment) return null;

  return (
    <Card className='border-l-4 border-l-amber-500 dark:border-l-amber-400'>
      <CardHeader className='pb-2'>
        <CardTitle className='flex items-center gap-2 text-lg'>
          <FileText className='h-5 w-5 text-amber-500 dark:text-amber-400' />
          <span>Comentario</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className='h-[100px] w-full rounded-md border p-4'>
          <p className='text-sm'>{comment}</p>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
