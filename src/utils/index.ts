export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getToday = (): string => {
  return formatDate(new Date());
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const filterBooks = (
  books: any[],
  ageFilter: string,
  themeFilter: string,
  durationFilter: string
): any[] => {
  return books.filter(book => {
    const ageMatch = ageFilter === 'all' || book.ageRange === ageFilter;
    const themeMatch = themeFilter === 'all' || book.theme === themeFilter;
    let durationMatch = true;
    if (durationFilter === 'short') {
      durationMatch = book.duration >= 5 && book.duration <= 8;
    } else if (durationFilter === 'medium') {
      durationMatch = book.duration > 8 && book.duration <= 12;
    } else if (durationFilter === 'long') {
      durationMatch = book.duration > 12;
    }
    return ageMatch && themeMatch && durationMatch;
  });
};
