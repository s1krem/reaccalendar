export interface Reminder {
    id?: number;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
  }
  
  export interface Holiday {
    date: string;       
    localName: string;  
    name: string;       
    countryCode?: string;
    global?: boolean;
  }
  