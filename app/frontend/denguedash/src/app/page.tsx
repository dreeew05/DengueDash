import GuestHeader from "@components/guest/GuestHeader";
import StatDashboard from "@components/stat_dashboard/StatDashboard";

export default function Home() {
  return (
    <>
      <GuestHeader />
      <div className="container py-6 w-5/6 mx-auto">
        <StatDashboard />
      </div>
    </>
  );
}
