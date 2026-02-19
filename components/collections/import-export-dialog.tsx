'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { Upload, Download, FileJson } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { useCollectionsStore } from '@/store/use-collections-store'
import {
  importPostmanCollection,
  exportPostmanCollection,
  validatePostmanCollection,
} from '@/lib/postman-converter'
import type { Collection } from '@/types'

interface ImportExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImportExportDialog({
  open,
  onOpenChange,
}: ImportExportDialogProps) {
  const [activeTab, setActiveTab] = useState('import')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { collections, importCollection } = useCollectionsStore()

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log('[v0] Starting import, file:', file.name)

    try {
      const text = await file.text()
      console.log('[v0] File read successfully, length:', text.length)
      
      const json = JSON.parse(text)
      console.log('[v0] JSON parsed successfully, collection name:', json?.info?.name)

      if (!validatePostmanCollection(json)) {
        console.log('[v0] Validation failed')
        toast.error('Invalid Postman collection format')
        return
      }

      console.log('[v0] Validation passed, converting...')
      const collection = importPostmanCollection(json)
      console.log('[v0] Converted collection:', {
        name: collection.name,
        requestsCount: collection.requests.length,
        foldersCount: collection.folders.length,
      })
      
      importCollection(collection)
      console.log('[v0] Collection imported to store')
      
      toast.success(`Collection "${collection.name}" imported successfully`)
      onOpenChange(false)
    } catch (error) {
      console.error('[v0] Import error:', error)
      toast.error('Failed to import collection. Please check the file format.')
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleExport = (collection: Collection) => {
    try {
      const postmanCollection = exportPostmanCollection(collection)
      const json = JSON.stringify(postmanCollection, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${collection.name.replace(/[^a-z0-9]/gi, '_')}.postman_collection.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success(`Collection "${collection.name}" exported successfully`)
    } catch (error) {
      console.error('[v0] Export error:', error)
      toast.error('Failed to export collection')
    }
  }

  const handleExportAll = () => {
    if (collections.length === 0) {
      toast.error('No collections to export')
      return
    }

    collections.forEach((collection) => {
      handleExport(collection)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import/Export Collections</DialogTitle>
          <DialogDescription>
            Import Postman collections or export your collections to Postman format
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import">
              <Upload className="mr-2 h-4 w-4" />
              Import
            </TabsTrigger>
            <TabsTrigger value="export">
              <Download className="mr-2 h-4 w-4" />
              Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center">
                <FileJson className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">
                  Import Postman Collection
                </h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Select a Postman collection JSON file (v2.1 format)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImport}
                  className="hidden"
                  id="collection-import"
                />
                <Label htmlFor="collection-import">
                  <Button asChild>
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      Choose File
                    </span>
                  </Button>
                </Label>
              </div>

              <div className="rounded-lg bg-muted p-4">
                <h4 className="mb-2 font-medium">Supported Format</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Postman Collection v2.1</li>
                  <li>• Requests with all HTTP methods</li>
                  <li>• Headers, Query Parameters, and Body</li>
                  <li>• Authentication (Bearer, Basic, API Key)</li>
                  <li>• Nested folders and collections</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-4 pt-4">
            <div className="space-y-4">
              {collections.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-border p-12 text-center">
                  <FileJson className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">No Collections</h3>
                  <p className="text-sm text-muted-foreground">
                    Create a collection first to export it
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Your Collections</h3>
                      <p className="text-sm text-muted-foreground">
                        Export collections to Postman format
                      </p>
                    </div>
                    <Button onClick={handleExportAll} variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Export All
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {collections.map((collection) => (
                      <div
                        key={collection.id}
                        className="flex items-center justify-between rounded-lg border border-border p-4"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium">{collection.name}</h4>
                          {collection.description && (
                            <p className="text-sm text-muted-foreground">
                              {collection.description}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-muted-foreground">
                            {collection.requests.length} request
                            {collection.requests.length !== 1 ? 's' : ''} • {' '}
                            {collection.folders.length} folder
                            {collection.folders.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleExport(collection)}
                          variant="outline"
                          size="sm"
                        >
                          <Download className="mr-2 h-3 w-3" />
                          Export
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg bg-muted p-4">
                    <h4 className="mb-2 font-medium">Export Format</h4>
                    <p className="text-sm text-muted-foreground">
                      Collections are exported in Postman Collection v2.1 format
                      and can be imported directly into Postman or other compatible
                      tools.
                    </p>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
