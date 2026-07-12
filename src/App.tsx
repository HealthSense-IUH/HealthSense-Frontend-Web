import { ScrollArea } from "@/components/ui/scroll-area"
import { Toaster } from "@/components/ui/toaster"

function App() {
  return (
    <ScrollArea className="h-screen w-screen">
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <h1 className="text-5xl font-bold text-blue-600">
          HealthSense Frontend Web Application
        </h1>
      </div>
      <Toaster />
    </ScrollArea>
  );
}

export default App;