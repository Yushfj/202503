'use client';

import Image from 'next/image';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {useEffect, useState} from 'react';
import {Trash2, Edit, Home, ArrowLeft} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useToast} from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import Link from 'next/link';

// Import the getEmployees and deleteEmployee functions from the service
import { getEmployees, deleteEmployee } from '@/services/employee-service';


interface Employee {
  id: string;
  name: string;
  position: string;
  hourlyWage: string;
  fnpfNo: string;
  tinNo: string;
  bankCode: string;
  bankAccountNumber: string;
  paymentMethod: 'cash' | 'online';
  branch: 'labasa' | 'suva';
  fnpfEligible: boolean;
}

const EmployeeInformationPage = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const {toast} = useToast();
  const [deletePassword, setDeletePassword] = useState('');
  const ADMIN_PASSWORD = 'admin'; // Store this securely in a real application
  const [employeeToDeleteId, setEmployeeToDeleteId] = useState<string | null>(null); // State to hold the ID of the employee to delete


  useEffect(() => {
    // FIX: Fetch employees from the service (which loads from blob) instead of localStorage
    const fetchEmployees = async () => {
      try {
        const employeesList = await getEmployees();
        setEmployees(employeesList);
      } catch (error: any) {
        console.error('Failed to fetch employees:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to load employee information.',
          variant: 'destructive',
        });
        setEmployees([]); // Set to empty array on error
      }
    };

    fetchEmployees();
  }, [toast]); // Depend on toast

  // Function to open the delete confirmation dialog
  const confirmDelete = (employeeId: string) => {
      setEmployeeToDeleteId(employeeId);
      setDeletePassword(''); // Clear password when opening dialog
       // Trigger the dialog manually if needed, depending on AlertDialog implementation
      // document.getElementById('deleteAlertDialogTrigger')?.click(); // You might need an ID on AlertDialogTrigger
  };


  const handleDeleteEmployee = async () => { // Made async to await deleteEmployee service call
    if (deletePassword !== ADMIN_PASSWORD) {
      toast({
        title: 'Error',
        description: 'Incorrect password. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    if (!employeeToDeleteId) {
         // Should not happen if dialog is triggered correctly, but safety check
         toast({
             title: 'Error',
             description: 'No employee selected for deletion.',
             variant: 'destructive',
         });
         return;
    }

    try {
        // FIX: Use the deleteEmployee function from the service
        await deleteEmployee(employeeToDeleteId);

        // After successful deletion, refetch the updated list from the service
        const updatedEmployeesList = await getEmployees();
        setEmployees(updatedEmployeesList);

        toast({
          title: 'Success',
          description: 'Employee deleted successfully!',
        });

        // Clear the state after successful deletion
        setDeletePassword('');
        setEmployeeToDeleteId(null);

         // Manually close the dialog if needed, depending on AlertDialog implementation
        // document.getElementById('deleteAlertDialogTrigger')?.dispatchEvent(new MouseEvent('click'));

    } catch (error: any) {
        console.error('Error deleting employee:', error);
        toast({
            title: 'Error Deleting Employee',
            description: error.message || 'An error occurred during deletion.',
            variant: 'destructive',
        });
    }
  };

  const labasaEmployees = employees.filter(employee => employee.branch === 'labasa');
    const suvaEmployees = employees.filter(employee => employee.branch === 'suva');

  return (
    <div className="relative flex items-center justify-center min-h-screen">
      {/* Background Image */}
      <Image
        src="/red-and-black-gaming-wallpapers-top-red-and-black-lightning-dark-gamer.jpg" // Path to your image
        alt="Background Image"
        layout="fill"
        objectFit="cover"
        className="absolute top-0 left-0 w-full h-full -z-10"
        priority
      />

      {/* Overlay for better readability */}
      <div className="absolute inset-0 w-full h-full bg-black opacity-50 -z-9" />

      {/* Content */}
      <Card className="w-full max-w-4xl bg-transparent backdrop-blur-md shadow-lg rounded-lg border border-accent/40 z-10">
        <CardHeader className="relative">
            <Link href="/employees" className="absolute top-4 left-4"> {/* Adjusted top/left for better spacing */}
                <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-5 w-5 text-white" /> {/* Increased size */}
                    <span className="sr-only">Back</span>
                </Button>
            </Link>
          <CardTitle className="text-2xl text-white text-center pt-2">
            Employee Information
          </CardTitle>
          {/* Home Button */}
          <Link href="/dashboard" className="absolute top-4 right-4"> {/* Adjusted top/right for better spacing */}
            <Button variant="ghost" size="icon">
              <Home className="h-5 w-5 text-white" /> {/* Increased size */}
              <span className="sr-only">Home</span>
            </Button>
          </Link>
        </CardHeader>
        <CardContent>

            {/* Labasa Branch Employees */}
            {labasaEmployees.length > 0 && (
                <>
                    <h2 className="text-xl text-white mb-4 border-b border-white/20 pb-2">Labasa Branch Employees</h2> {/* Added bottom margin and border */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {labasaEmployees.map((employee, index) => (
                            <div
                                key={employee.id} // Use employee.id as key for better practice
                                className="bg-secondary/70 rounded-lg p-4 text-white shadow-md relative"
                            >
                                <div className="absolute top-2 right-2 flex">
                                    <Link href={`/employees/change?id=${employee.id}`} className="mr-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-white hover:text-blue-400" // Adjusted hover color
                                        >
                                            <Edit className="h-4 w-4" />
                                            <span className="sr-only">Edit</span>
                                        </Button>
                                    </Link>
                                     {/* Use AlertDialogTrigger to open the dialog */}
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-white hover:text-red-400" // Adjusted hover color
                                            onClick={() => confirmDelete(employee.id)} // Set employee ID to delete when button is clicked
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">Delete</span>
                                        </Button>
                                    </AlertDialogTrigger>
                                </div>
                                <h3 className="text-lg font-semibold mb-1">{employee.name}</h3> {/* Added margin bottom */}
                                <p className="text-sm text-gray-300 mb-1">Position: {employee.position}</p> {/* Added margin bottom and text style */}
                                <p className="text-sm text-gray-300 mb-1">Hourly Wage: ${parseFloat(employee.hourlyWage).toFixed(2)}</p> {/* Parse and format wage */}
                                <p className="text-sm text-gray-300 mb-1">FNPF No: {employee.fnpfNo || 'N/A'}</p> {/* Handle empty FNPF */}
                                <p className="text-sm text-gray-300 mb-1">TIN No: {employee.tinNo || 'N/A'}</p> {/* Handle empty TIN */}
                                 <p className="text-sm text-gray-300 mb-1">
                                         FNPF Eligible: {employee.fnpfEligible ? 'Yes' : 'No'}
                                </p>
                                {employee.paymentMethod === 'online' ? (
                                    <>
                                        <p className="text-sm text-gray-300 mb-1">Bank Code: {employee.bankCode || 'N/A'}</p> {/* Handle empty bank code */}
                                        <p className="text-sm text-gray-300">Bank Account No: {employee.bankAccountNumber || 'N/A'}</p> {/* Handle empty account number */}
                                    </>
                                ) : (
                                    <p className="text-sm text-gray-300">Payment Method: Cash Wages</p>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Suva Branch Employees */}
            {suvaEmployees.length > 0 && (
                <>
                    <h2 className="text-xl text-white mb-4 mt-6 border-b border-white/20 pb-2">Suva Branch Employees</h2> {/* Added margin top/bottom and border */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {suvaEmployees.map((employee, index) => (
                            <div
                                key={employee.id} // Use employee.id as key
                                className="bg-secondary/70 rounded-lg p-4 text-white shadow-md relative"
                            >
                                <div className="absolute top-2 right-2 flex">
                                    <Link href={`/employees/change?id=${employee.id}`} className="mr-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-white hover:text-blue-400" // Adjusted hover color
                                        >
                                            <Edit className="h-4 w-4" />
                                            <span className="sr-only">Edit</span>
                                        </Button>
                                    </Link>
                                     {/* Use AlertDialogTrigger to open the dialog */}
                                     <AlertDialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-white hover:text-red-400" // Adjusted hover color
                                             onClick={() => confirmDelete(employee.id)} // Set employee ID to delete
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">Delete</span>
                                        </Button>
                                    </AlertDialogTrigger>
                                </div>
                                <h3 className="text-lg font-semibold mb-1">{employee.name}</h3> {/* Added margin bottom */}
                                <p className="text-sm text-gray-300 mb-1">Position: {employee.position}</p> {/* Added margin bottom and text style */}
                                <p className="text-sm text-gray-300 mb-1">Hourly Wage: ${parseFloat(employee.hourlyWage).toFixed(2)}</p> {/* Parse and format wage */}
                                <p className="text-sm text-gray-300 mb-1">FNPF No: {employee.fnpfNo || 'N/A'}</p> {/* Handle empty FNPF */}
                                <p className="text-sm text-gray-300 mb-1">TIN No: {employee.tinNo || 'N/A'}</p> {/* Handle empty TIN */}
                                 <p className="text-sm text-gray-300 mb-1">
                                         FNPF Eligible: {employee.fnpfEligible ? 'Yes' : 'No'}
                                </p>
                                {employee.paymentMethod === 'online' ? (
                                    <>
                                        <p className="text-sm text-gray-300 mb-1">Bank Code: {employee.bankCode || 'N/A'}</p> {/* Handle empty bank code */}
                                        <p className="text-sm text-gray-300">Bank Account No: {employee.bankAccountNumber || 'N/A'}</p> {/* Handle empty account number */}
                                    </>
                                ) : (
                                    <p className="text-sm text-gray-300">Payment Method: Cash Wages</p>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}

           {/* Message when no employees exist */}
           {employees.length === 0 ? (
             <p className="text-white text-center text-lg mt-4">No employee information available.</p>
           ) : null}

        </CardContent>
      </Card>

       {/* AlertDialog for delete confirmation - Keep outside the Card */}
       <AlertDialog>
            {/* AlertDialogTrigger is now used on the delete buttons within the cards */}
            {/* <AlertDialogTrigger asChild>
                 <Button variant="ghost" style={{display:"none"}}>Show Dialog</Button>
            </AlertDialogTrigger> */}
            <AlertDialogContent className="bg-gray-900 border-white/20 text-white">
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-300">
                        Are you sure you want to delete this employee? This action cannot be undone.
                        Please enter the admin password to confirm.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="grid gap-2">
                    <Label htmlFor="password" className="text-gray-300">Admin Password</Label>
                    <Input
                        id="password"
                        type="password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        className="bg-gray-800 border-white/20 text-white"
                        onKeyPress={(e) => { // Allow confirming with Enter key
                            if (e.key === 'Enter') {
                                handleDeleteEmployee();
                                // Manually close the dialog if needed, depending on AlertDialog implementation
                                // document.getElementById('deleteAlertDialogTrigger')?.dispatchEvent(new MouseEvent('click'));
                            }
                        }}
                    />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDeleteEmployee} // Call handleDeleteEmployee on confirm
                        className="bg-red-600 hover:bg-red-700"
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

    </div>
  );
};

export default EmployeeInformationPage;
