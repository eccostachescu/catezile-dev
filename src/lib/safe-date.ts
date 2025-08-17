import { format, isValid, parseISO } from 'date-fns';
import { ro } from 'date-fns/locale';

// Helper function pentru formatarea sigură a datelor
export const formatEventDate = (dateString: string | Date | number | null | undefined): string => {
  if (!dateString) {
    return 'Data nedefinită';
  }

  try {
    let date: Date;
    
    if (typeof dateString === 'string') {
      // Încearcă să parseze string-ul ca dată ISO
      date = parseISO(dateString);
      
      // Dacă parseISO nu reușește, încearcă new Date()
      if (!isValid(date)) {
        date = new Date(dateString);
      }
    } else if (typeof dateString === 'number') {
      // Pentru timestamp-uri numerice
      date = new Date(dateString);
    } else if (dateString instanceof Date) {
      date = dateString;
    } else {
      throw new Error('Invalid date type');
    }

    // Verifică dacă data este validă
    if (!isValid(date)) {
      console.warn('Invalid date detected:', dateString);
      return 'Data invalidă';
    }

    // Formatează data
    return format(date, 'dd MMM yyyy, HH:mm', { locale: ro });
    
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return 'Data invalidă';
  }
};

// Versiune scurtă doar cu data
export const formatEventDateShort = (dateString: string | Date | number | null | undefined): string => {
  if (!dateString) {
    return 'Data nedefinită';
  }

  try {
    let date: Date;
    
    if (typeof dateString === 'string') {
      date = parseISO(dateString);
      if (!isValid(date)) {
        date = new Date(dateString);
      }
    } else if (typeof dateString === 'number') {
      date = new Date(dateString);
    } else if (dateString instanceof Date) {
      date = dateString;
    } else {
      throw new Error('Invalid date type');
    }

    if (!isValid(date)) {
      console.warn('Invalid date detected:', dateString);
      return 'Data invalidă';
    }

    return format(date, 'dd MMM yyyy', { locale: ro });
    
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return 'Data invalidă';
  }
};

// Helper pentru formatarea orelor
export const formatEventTime = (dateString: string | Date | number | null | undefined): string => {
  if (!dateString) {
    return 'Ora nedefinită';
  }

  try {
    let date: Date;
    
    if (typeof dateString === 'string') {
      date = parseISO(dateString);
      if (!isValid(date)) {
        date = new Date(dateString);
      }
    } else if (typeof dateString === 'number') {
      date = new Date(dateString);
    } else if (dateString instanceof Date) {
      date = dateString;
    } else {
      throw new Error('Invalid date type');
    }

    if (!isValid(date)) {
      console.warn('Invalid time detected:', dateString);
      return 'Ora invalidă';
    }

    return format(date, 'HH:mm', { locale: ro });
    
  } catch (error) {
    console.error('Error formatting time:', dateString, error);
    return 'Ora invalidă';
  }
};