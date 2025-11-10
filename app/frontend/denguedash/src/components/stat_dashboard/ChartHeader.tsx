type ChartHeaderProps = {
  title: string;
};

export default function ChartHeader({ title }: ChartHeaderProps) {
  return (
    <div className="p-4 border-b border-gray">
      <h1 className="text-2xl font-bold">{title}</h1>
    </div>
  );
}
