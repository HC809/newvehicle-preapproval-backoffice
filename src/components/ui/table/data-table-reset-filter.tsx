'use client';
import { Button } from '../button';

type DataTableResetFilterProps = {
  isFilterActive: boolean;
  onReset: () => void;
  translatedReset?: string;
};

export function DataTableResetFilter({
  isFilterActive,
  onReset,
  translatedReset
}: DataTableResetFilterProps) {
  return (
    <>
      {isFilterActive ? (
        <Button variant='outline' onClick={onReset}>
          {translatedReset || 'Reset Filters'}
        </Button>
      ) : null}
    </>
  );
}
