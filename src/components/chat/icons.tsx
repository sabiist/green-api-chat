import { MessageCirclePlus, ArrowLeftRight, SendHorizonal, EllipsisVertical } from 'lucide-react';

type IconProps = {
  className?: string;
};

export function ChatPlusIcon({ className }: IconProps) {
  return <MessageCirclePlus className={className} aria-hidden="true" />;
}

export function SwitchInstanceIcon({ className }: IconProps) {
  return <ArrowLeftRight className={className} aria-hidden="true" />;
}

export function SendIcon({ className }: IconProps) {
  return <SendHorizonal className={className} aria-hidden="true" />;
}

export function DotsIcon({ className }: IconProps) {
  return <EllipsisVertical className={className} aria-hidden="true" />;
}
