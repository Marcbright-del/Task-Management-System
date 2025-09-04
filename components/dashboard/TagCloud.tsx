
import React, { useMemo } from 'react';
import type { Task } from '../../types';
import { Tag } from '../Tag';

interface TagCloudProps {
  tasks: Task[];
  activeTag: string | null;
  setActiveTag: (tag: string | null) => void;
}

export const TagCloud: React.FC<TagCloudProps> = ({ tasks, activeTag, setActiveTag }) => {
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    tasks.forEach(task => {
      task.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [tasks]);

  if (allTags.length === 0) return null;

  const handleTagClick = (tag: string) => {
    if (activeTag === tag) {
      setActiveTag(null); // Deselect if clicking the active tag
    } else {
      setActiveTag(tag);
    }
  };

  return (
    <div>
      <h3 className="text-sm font-bold uppercase text-base-content-secondary mb-2">Filter by Tag</h3>
      <div className="flex flex-wrap gap-2">
        {allTags.map(tag => (
          <Tag 
            key={tag} 
            tag={tag} 
            onClick={() => handleTagClick(tag)} 
            isActive={activeTag === tag} 
          />
        ))}
        {activeTag && (
            <button onClick={() => setActiveTag(null)} className="text-xs text-base-content-secondary hover:underline">Clear</button>
        )}
      </div>
    </div>
  );
};