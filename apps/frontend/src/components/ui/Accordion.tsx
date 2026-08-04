import * as RAccordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface AccordionItemData {
  id: string;
  question: string;
  answer: string;
}

export function Accordion({ items }: { items: AccordionItemData[] }) {
  return (
    <RAccordion.Root type="single" collapsible className="divide-y divide-ala-grey-200">
      {items.map((item) => (
        <RAccordion.Item key={item.id} value={item.id} className="py-1">
          <RAccordion.Header>
            <RAccordion.Trigger className="group flex w-full items-center justify-between gap-4 py-5 text-left font-heading text-lg font-semibold text-ala-navy">
              {item.question}
              <ChevronDown
                className="h-5 w-5 shrink-0 text-ala-red transition-transform duration-200 group-data-[state=open]:rotate-180"
                aria-hidden
              />
            </RAccordion.Trigger>
          </RAccordion.Header>
          <RAccordion.Content
            className={cn(
              'overflow-hidden text-ala-grey-500',
              'data-[state=open]:animate-fade-up',
            )}
          >
            <div className="pb-5 pr-8">{item.answer}</div>
          </RAccordion.Content>
        </RAccordion.Item>
      ))}
    </RAccordion.Root>
  );
}
