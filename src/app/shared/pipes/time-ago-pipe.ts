import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: string | number | Date | null | undefined): string {
    if (!value) return '';

    const date = new Date(value);
    const now = new Date();
    const elapsedSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (elapsedSeconds < 30) {
      return 'just now';
    }

    const intervals: { [key: string]: number } = {
      y: 31536000,
      mo: 2592000,
      w: 604800,
      d: 86400,
      h: 3600,
      m: 60,
      s: 1,
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const count = Math.floor(elapsedSeconds / secondsInUnit);
      if (count >= 1) {
        // e.g. "12h" or "3d" (social media style)
        return `${count}${unit} ago`;

        // Or if you prefer verbose output ("12 hours ago"):
        // return `${count} ${unit}${count > 1 ? 's' : ''} ago`;
      }
    }

    return 'just now';
  }
}
