import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Building, User, UserCog, Info, Eye } from 'lucide-react';
import { LoanRequest, LoanRequestStatus } from 'types/LoanRequests';
import { Badge } from '@/components/ui/badge';
import { formatLoanRequestId } from '@/utils/formatId';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { UserRole } from 'types/User';
import { translateRole } from '@/utils/translateRole';
import { formatPhoneNumber } from '@/utils/formatPhoneNumber';
import {
  translateStatus,
  getStatusVariant,
  getStatusClassName
} from '@/utils/getStatusColor';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';
