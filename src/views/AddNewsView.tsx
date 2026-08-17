import React from 'react';
import { NewsForm } from '../components/NewsForm';

interface AddNewsViewProps {
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

export const AddNewsView: React.FC<AddNewsViewProps> = ({
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  return (
    <div id="add-news-view" className="animate-in fade-in duration-200">
      <NewsForm
        mode="add"
        onSubmit={onSubmit}
        onCancel={onCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
