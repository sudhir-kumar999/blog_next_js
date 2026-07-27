interface KeyTakeawayProps {
  children: string;
  label?: string;
}

export default function KeyTakeaway({ children, label }: KeyTakeawayProps) {
  return (
    <div className="my-8 rounded-xl border-l-4 border-blue-600 bg-blue-50 p-5 sm:p-6">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-700">
        {label || "Key Takeaway"}
      </p>
      <p className="text-base font-medium leading-relaxed text-zinc-900 sm:text-lg">
        {children}
      </p>
    </div>
  );
}
