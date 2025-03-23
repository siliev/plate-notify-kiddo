
import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { usePlateContext } from '@/context/PlateContext';
import Header from '@/components/layout/Header';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Car, Plus, Trash2, Edit, X, FileText, RefreshCw } from 'lucide-react';

const Admin = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { plates, addPlate, updatePlate, deletePlate } = usePlateContext();
  const navigate = useNavigate();
  
  const [newPlate, setNewPlate] = useState({ plateNumber: '', childName: '', notes: '' });
  const [editingPlate, setEditingPlate] = useState<null | { plateNumber: string; childName: string; notes?: string }>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Redirect if not logged in
  if (!authLoading && !user) {
    return <Navigate to="/login" replace />;
  }
  
  // Filter plates based on search query
  const filteredPlates = plates.filter(plate => 
    plate.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
    plate.childName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Sort by plateNumber
  const sortedPlates = [...filteredPlates].sort((a, b) => 
    a.plateNumber.localeCompare(b.plateNumber)
  );
  
  // Handle adding a new plate
  const handleAddPlate = () => {
    if (!newPlate.plateNumber || !newPlate.childName) {
      toast.error('Plate number and child name are required');
      return;
    }
    
    addPlate({
      plateNumber: newPlate.plateNumber.toUpperCase(),
      childName: newPlate.childName,
      notes: newPlate.notes
    });
    
    // Reset form
    setNewPlate({ plateNumber: '', childName: '', notes: '' });
    setIsAdding(false);
  };
  
  // Handle updating a plate
  const handleUpdatePlate = () => {
    if (!editingPlate || !editingPlate.childName) {
      toast.error('Child name is required');
      return;
    }
    
    updatePlate(editingPlate.plateNumber, {
      childName: editingPlate.childName,
      notes: editingPlate.notes
    });
    
    // Reset form
    setEditingPlate(null);
    setIsEditing(false);
  };
  
  return (
    <>
      <Header />
      <div className="min-h-screen pt-20 pb-10">
        <Container className="max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-1">Manage car plates and child associations</p>
              </div>
              
              <Dialog open={isAdding} onOpenChange={setIsAdding}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus size={16} />
                    <span>Add Plate</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Plate</DialogTitle>
                    <DialogDescription>
                      Add a new plate number and associate it with a child.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label htmlFor="plateNumber" className="text-sm font-medium">Plate Number</label>
                      <Input
                        id="plateNumber"
                        placeholder="e.g. ABC123"
                        value={newPlate.plateNumber}
                        onChange={(e) => setNewPlate({ ...newPlate, plateNumber: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="childName" className="text-sm font-medium">Child's Name</label>
                      <Input
                        id="childName"
                        placeholder="e.g. Jane Smith"
                        value={newPlate.childName}
                        onChange={(e) => setNewPlate({ ...newPlate, childName: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="notes" className="text-sm font-medium">Notes (Optional)</label>
                      <Textarea
                        id="notes"
                        placeholder="Any additional information"
                        value={newPlate.notes}
                        onChange={(e) => setNewPlate({ ...newPlate, notes: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
                    <Button onClick={handleAddPlate}>Add Plate</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Plate</DialogTitle>
                    <DialogDescription>
                      Update information for plate {editingPlate?.plateNumber}.
                    </DialogDescription>
                  </DialogHeader>
                  
                  {editingPlate && (
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label htmlFor="edit-childName" className="text-sm font-medium">Child's Name</label>
                        <Input
                          id="edit-childName"
                          placeholder="e.g. Jane Smith"
                          value={editingPlate.childName}
                          onChange={(e) => setEditingPlate({ ...editingPlate, childName: e.target.value })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="edit-notes" className="text-sm font-medium">Notes (Optional)</label>
                        <Textarea
                          id="edit-notes"
                          placeholder="Any additional information"
                          value={editingPlate.notes || ''}
                          onChange={(e) => setEditingPlate({ ...editingPlate, notes: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                    <Button onClick={handleUpdatePlate}>Update Plate</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <Card className="p-6">
              <Tabs defaultValue="plates">
                <TabsList className="mb-6">
                  <TabsTrigger value="plates" className="gap-2">
                    <Car size={16} />
                    <span>Plates</span>
                  </TabsTrigger>
                  <TabsTrigger value="documentation" className="gap-2">
                    <FileText size={16} />
                    <span>API Documentation</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="plates" className="space-y-6">
                  <div className="relative">
                    <Input
                      placeholder="Search plates or children..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="max-w-md"
                    />
                  </div>
                  
                  <div className="rounded-md border">
                    <div className="grid grid-cols-12 gap-4 p-4 bg-muted/40 font-medium">
                      <div className="col-span-3">Plate Number</div>
                      <div className="col-span-4">Child Name</div>
                      <div className="col-span-3">Last Arrival</div>
                      <div className="col-span-2 text-right">Actions</div>
                    </div>
                    
                    <div className="divide-y">
                      <AnimatePresence>
                        {sortedPlates.length > 0 ? (
                          sortedPlates.map((plate) => (
                            <motion.div
                              key={plate.plateNumber}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/20"
                            >
                              <div className="col-span-3 font-mono font-medium">
                                {plate.plateNumber}
                              </div>
                              <div className="col-span-4">
                                {plate.childName}
                              </div>
                              <div className="col-span-3 text-sm text-muted-foreground">
                                {new Intl.DateTimeFormat('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: 'numeric',
                                  minute: 'numeric',
                                  hour12: true
                                }).format(new Date(plate.timestamp))}
                              </div>
                              <div className="col-span-2 flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingPlate({
                                      plateNumber: plate.plateNumber,
                                      childName: plate.childName,
                                      notes: plate.notes
                                    });
                                    setIsEditing(true);
                                  }}
                                >
                                  <Edit size={16} />
                                </Button>
                                
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-destructive">
                                      <Trash2 size={16} />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently delete the plate <span className="font-medium">{plate.plateNumber}</span> and its associated data.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => deletePlate(plate.plateNumber)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </motion.div>
                          ))
                        ) : (
                          <div className="p-8 text-center">
                            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                              <Car size={20} className="text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium mb-1">No plates found</h3>
                            <p className="text-muted-foreground mb-4">
                              {searchQuery 
                                ? 'No plates match your search criteria' 
                                : 'Add your first plate to get started'}
                            </p>
                            {!searchQuery && (
                              <Button
                                onClick={() => setIsAdding(true)}
                                variant="outline"
                                className="gap-2"
                              >
                                <Plus size={16} />
                                <span>Add Plate</span>
                              </Button>
                            )}
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="documentation">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold mb-2">API Documentation</h2>
                      <p className="text-muted-foreground">
                        Integrate with the PlateNotify API to send plate numbers from your camera system.
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Plate API Endpoint</h3>
                      <Card className="p-4 bg-muted/40 font-mono text-sm">
                        POST /api/plate
                      </Card>
                      
                      <h3 className="text-lg font-medium">Request Format</h3>
                      <Card className="p-4 bg-muted/40 font-mono text-sm whitespace-pre">
{`{
  "plateNumber": "AB123CD"
}`}
                      </Card>
                      
                      <h3 className="text-lg font-medium">Response Format</h3>
                      <Card className="p-4 bg-muted/40 font-mono text-sm whitespace-pre">
{`{
  "success": true,
  "message": "Plate processed successfully",
  "data": {
    "plateNumber": "AB123CD",
    "childName": "Emma Johnson",
    "timestamp": "2023-06-15T14:30:45.123Z"
  }
}`}
                      </Card>
                      
                      <h3 className="text-lg font-medium">Error Response</h3>
                      <Card className="p-4 bg-muted/40 font-mono text-sm whitespace-pre">
{`{
  "success": false,
  "message": "Plate not found",
  "error": "NOT_FOUND"
}`}
                      </Card>
                      
                      <h3 className="text-lg font-medium">Example Usage (JavaScript)</h3>
                      <Card className="p-4 bg-muted/40 font-mono text-sm whitespace-pre">
{`// Example using fetch API
fetch('https://yourdomainhere.com/api/plate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    plateNumber: 'AB123CD'
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`}
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </motion.div>
        </Container>
      </div>
    </>
  );
};

export default Admin;
