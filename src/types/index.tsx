export interface Reminder {
    id?: number;
    title: string;
    description: string;
    startTime: string;
    recurrence?: string | null;
    recurrenceEndTime?: string | null;
    createdDate?: string;
    updatedDate?: string;
  }
  
  export interface Holiday {
    date: string;       
    localName: string;  
    name: string;       
    countryCode?: string;
    global?: boolean;
  }
  