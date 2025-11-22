import { SpeedInsights } from "@vercel/speed-insights/react"

function App() {
  return (
    <>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Start prompting (or editing) to see magic happen :)</p>
      </div>
      <SpeedInsights />
    </>
  );
}

export default App;
