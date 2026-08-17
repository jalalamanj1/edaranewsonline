import React from 'react';
import { NewsItem } from '../types';
import { NewsForm } from '../components/NewsForm';

interface EditNewsViewProps {
  item: NewsItem;
  onSubmit: (data: {
    title: string;
    content: string;
    category: string | null;
    image_url: string | null;
    source_url: string | null;
    published: boolean;
    published_at: string;
  }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const EditNewsView: React.FC<EditNewsViewProps> = ({
  item,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  return (
    <div id="edit-news-view" className="animate-in fade-in duration-200">
      <NewsForm
        initialData={item}
        mode="edit"
        onSubmit={onSubmit}
        onCancel={onCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
