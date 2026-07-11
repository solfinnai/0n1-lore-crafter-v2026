"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getStoredSouls, storeSoul } from "@/lib/storage-wrapper"
import { ArrowLeft, RefreshCw, Save } from "lucide-react"
import { useRouter } from "next/navigation"

export default function DebugStoragePage() {
  const router = useRouter()
  const [souls, setSouls] = useState<any[]>([])
  const [rawData, setRawData] = useState<string>("")

  const loadData = () => {
    // Get from storage wrapper
    const storedSouls = getStoredSouls()
    setSouls(storedSouls)
    
    // Also get raw localStorage data
    const raw = localStorage.getItem("oni-souls")
    setRawData(raw || "No data in localStorage")
    
    console.log("🔍 Debug Storage Page - Loaded data:")
    console.log("- Souls count:", storedSouls.length)
    console.log("- Raw localStorage data:", raw)
  }

  useEffect(() => {
    loadData()
  }, [])

  const createTestSoul = () => {
    const testData = {
      pfpId: "9999",
      soulName: `Test Soul ${Date.now()}`,
      traits: [],
      archetype: "Test Archetype",
      background: "Test Background",
      hopesFears: { hopes: "Test hopes", fears: "Test fears" },
      personalityProfile: { description: "Test personality" },
      motivations: { drives: "Test drives", goals: "Test goals", values: "Test values" },
      relationships: { friends: "Test friends", rivals: "Test rivals", family: "Test family" },
      worldPosition: { societalRole: "Test role", classStatus: "Test class", perception: "Test perception" },
      voice: { speechStyle: "Test style", innerDialogue: "Test dialogue", uniquePhrases: "Test phrases" },
      symbolism: { colors: "Test colors", items: "Test items", motifs: "Test motifs" },
      powersAbilities: { powers: ["Test Power"], description: "Test description" }
    }
    
    storeSoul(testData)
    loadData()
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Storage Debug</h1>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={createTestSoul} variant="outline">
            <Save className="mr-2 h-4 w-4" />
            Create Test Soul
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Stored Souls Summary ({souls.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {souls.length === 0 ? (
              <p className="text-muted-foreground">No souls found</p>
            ) : (
              <div className="space-y-4">
                {souls.map((soul, index) => (
                  <div key={soul.id} className="p-4 border rounded-lg space-y-2">
                    <div className="font-semibold">Soul #{index + 1}</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">ID:</span> {soul.id}
                      </div>
                      <div>
                        <span className="text-muted-foreground">NFT ID:</span> {soul.data.pfpId}
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Name:</span> {soul.data.soulName || "NO NAME"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Archetype:</span> {soul.data.archetype || "None"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created:</span> {new Date(soul.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-muted-foreground">View Full Data</summary>
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                        {JSON.stringify(soul, null, 2)}
                      </pre>
                    </details>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Raw localStorage Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="p-4 bg-muted rounded overflow-auto text-xs">
              {rawData}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 