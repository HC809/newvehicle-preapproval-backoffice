import { FileText, Image, File, FileCode, Table } from 'lucide-react';
import React from 'react';
import { ReactNode } from 'react';

export const getDocumentIcon = (contentType: string): ReactNode => {
  switch (true) {
    case contentType.includes('pdf'):
      return (
        <FileText
          className='h-10 w-10 text-red-500'
          aria-label='PDF document icon'
        />
      );
    case contentType.includes('image'):
      return (
        <Image
          className='h-10 w-10 text-blue-500'
          aria-label='Image document icon'
        />
      );
    case contentType.includes('xml') || contentType.includes('text'):
      return (
        <FileCode
          className='h-10 w-10 text-green-500'
          aria-label='XML or text document icon'
        />
      );
    case contentType.includes('word') || contentType.includes('doc'):
      return (
        <FileText
          className='h-10 w-10 text-blue-700'
          aria-label='Word document icon'
        />
      );
    case contentType.includes('excel') ||
      contentType.includes('sheet') ||
      contentType.includes('csv'):
      return (
        <Table
          className='h-10 w-10 text-green-700'
          aria-label='Spreadsheet document icon'
        />
      );
    default:
      return (
        <File
          className='h-10 w-10 text-gray-500'
          aria-label='Generic document icon'
        />
      );
  }
};
