// app/create-campaign/layout.js
//import Header from "../components/Layouts/Header";

export default function CreateCampaignLayout({ children }) {
  return (
    <>
      
      <main className="min-h-[calc(100vh-85px)] bg-background">
        {children}
      </main>
    </>
  );
}