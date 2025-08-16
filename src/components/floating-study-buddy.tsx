'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MessageCircleHeart } from 'lucide-react';
import { StudyBuddy } from './study-buddy';

export function FloatingStudyBuddy() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="default"
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg z-20"
          aria-label="Open Study Buddy"
        >
          <MessageCircleHeart className="h-8 w-8" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 h-[60vh] p-0 mr-4 mb-2" side="top" align="end">
        <StudyBuddy />
      </PopoverContent>
    </Popover>
  );
}
