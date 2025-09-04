
import React from 'react';
import type { ActivityLogEntry } from '../../types';

interface ActivityFeedProps {
  log: ActivityLogEntry[];
}

const timeSince = (dateString: string) => {
  const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return Math.floor(seconds) + "s ago";
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ log }) => {
    if (log.length === 0) return null;

  return (
    <div>
        <h3 className="text-sm font-bold uppercase text-base-content-secondary mb-2">Recent Activity</h3>
        <ul className="space-y-2 text-xs">
            {log.map(entry => (
                <li key={entry.id} className="flex justify-between items-start gap-2">
                    <span className="text-base-content">{entry.message}</span>
                    <span className="text-base-content-secondary flex-shrink-0">{timeSince(entry.timestamp)}</span>
                </li>
            ))}
        </ul>
    </div>
  );
};