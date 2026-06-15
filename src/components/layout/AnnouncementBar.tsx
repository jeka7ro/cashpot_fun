export default function AnnouncementBar({
  text,
  bg,
  color,
}: {
  text: string;
  bg: string;
  color: string;
}) {
  return (
    <div
      className="w-full py-2 text-center text-xs font-semibold tracking-wide z-50"
      style={{ backgroundColor: bg, color }}
    >
      {text}
    </div>
  );
}
