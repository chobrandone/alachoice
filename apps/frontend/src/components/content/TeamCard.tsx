import * as Dialog from '@radix-ui/react-dialog';
import { Linkedin, X, User } from 'lucide-react';
import { useLocalized } from '@/lib/i18nField';
import type { TeamMember } from '@ala/types';

export function TeamCard({ member }: { member: TeamMember }) {
  const localized = useLocalized();
  const name = member.full_name;
  const role = localized(member, 'role');
  const bio = localized(member, 'bio');

  return (
    <div className="group overflow-hidden rounded-card border border-ala-grey-200 bg-white shadow-soft">
      <div className="aspect-[4/5] overflow-hidden bg-ala-grey-50">
        {member.photo_url ? (
          <img
            src={member.photo_url}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ala-grey-200">
            <User className="h-16 w-16" />
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-heading text-lg font-semibold text-ala-navy">{name}</h3>
        <p className="text-sm text-ala-red">{role}</p>
        <div className="mt-3 flex items-center gap-3">
          {bio && (
            <Dialog.Root>
              <Dialog.Trigger className="text-sm font-medium text-ala-navy hover:underline">
                Read bio
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-card bg-white p-8 shadow-soft-lg">
                  <Dialog.Title className="font-heading text-2xl font-bold text-ala-navy">
                    {name}
                  </Dialog.Title>
                  <p className="text-sm text-ala-red">{role}</p>
                  <Dialog.Description className="mt-4 max-h-[50vh] overflow-y-auto text-ala-grey-500">
                    {bio}
                  </Dialog.Description>
                  <Dialog.Close className="absolute right-4 top-4 text-ala-grey-500 hover:text-ala-navy" aria-label="Close">
                    <X className="h-5 w-5" />
                  </Dialog.Close>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          )}
          {member.linkedin_url && (
            <a
              href={member.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name} on LinkedIn`}
              className="text-ala-grey-500 hover:text-ala-navy"
            >
              <Linkedin className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
