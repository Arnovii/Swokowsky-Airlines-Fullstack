declare module 'react-date-range' {
  import { ComponentType } from 'react';
  
  export interface Range {
    startDate?: Date | null;
    endDate?: Date | null;
    key?: string;
  }

  export interface RangeKeyDict {
    [key: string]: Range;
  }

  export interface DateRangeProps {
    ranges?: Range[];
    onChange?: (ranges: RangeKeyDict) => void;
    moveRangeOnFirstSelection?: boolean;
    months?: number;
    direction?: 'horizontal' | 'vertical';
    locale?: Locale;
    minDate?: Date;
    maxDate?: Date;
    showDateDisplay?: boolean;
    rangeColors?: string[];
    color?: string;
    [key: string]: any;
  }

  export interface CalendarProps {
    date?: Date;
    onChange?: (date: Date) => void;
    locale?: Locale;
    minDate?: Date;
    maxDate?: Date;
    color?: string;
    [key: string]: any;
  }

  export const DateRange: ComponentType<DateRangeProps>;
  export const Calendar: ComponentType<CalendarProps>;
}
