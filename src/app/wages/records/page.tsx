'use client';

import {useEffect, useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {Button} from '@/components/ui/button';
import {Calendar} from '@/components/ui/calendar';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {cn} from '@/lib/utils';
import {format} from 'date-fns';
import {CalendarIcon, Home, ArrowLeft, Power} from 'lucide-react';
import {DateRange} from 'react-day-picker';
import {useToast} from '@/hooks/use-toast';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
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
import { useRouter } from 'next/navigation';

interface Employee {
  id: string;
  name: string;
  position: string;
  hourlyWage: string;
  fnpfNo: string;
  bankCode: string;
  bankAccountNumber: string;
  paymentMethod: 'cash' | 'online';
  branch: 'labasa' | 'suva';
  fnpfEligible: boolean;
}

interface WageRecord {
  employeeId: string;
  employeeName: string;
  hourlyWage: number;
  hoursWorked: number;
  fnpfDeduction: number;
  otherDeductions: number;
  grossPay: number;
  netPay: number;
  dateFrom: Date;
  dateTo: Date;
}

const WagesRecordsPage = () => {
  const [wageRecords, setWageRecords] = useState<WageRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  // FIX: Change null to undefined for initial state
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined, // Changed from null
    to: undefined,   // Changed from null
  });
  const [selectedDateRange, setSelectedDateRange] = useState<string | null>(null);
  const [filteredWageRecords, setFilteredWageRecords] = useState<WageRecord[]>([]);
  const {toast} = useToast();
  const [deletePassword, setDeletePassword] = useState('');
  const ADMIN_PASSWORD = 'admin';
  const router = useRouter();

  useEffect(() => {
    const storedWageRecords = localStorage.getItem('wageRecords');
    if (storedWageRecords) {
      setWageRecords(
        JSON.parse(storedWageRecords).map((record: any) => ({
          ...record,
          dateFrom: new Date(record.dateFrom),
          dateTo: new Date(record.dateTo),
        }))
      );
    }

    const storedEmployees = localStorage.getItem('employees');
    if (storedEmployees) {
      setEmployees(JSON.parse(storedEmployees));
    }
  }, []);

  useEffect(() => {
    if (selectedDateRange) {
      const [from, to] = selectedDateRange.split(' - ');
      const dateFrom = new Date(from);
      const dateTo = new Date(to);

      const filteredRecords = wageRecords.filter(record => {
        // Adjusting filter logic to match the exact date range selected
        // Comparing getTime() is a reliable way to compare Date objects
        return (
          record.dateFrom.getTime() === dateFrom.getTime() && record.dateTo.getTime() === dateTo.getTime()
        );
      });
      setFilteredWageRecords(filteredRecords);
    } else {
      setFilteredWageRecords([]);
    }
  }, [selectedDateRange, wageRecords]);

  const handleDeleteRecords = () => {
    if (deletePassword !== ADMIN_PASSWORD) {
      toast({
        title: 'Error',
        description: 'Incorrect password. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    // Use selectedDateRange for deletion if available, otherwise require dateRange picker
    const datesToDeleteFrom = selectedDateRange ? new Date(selectedDateRange.split(' - ')[0]) : dateRange?.from;
    const datesToDeleteTo = selectedDateRange ? new Date(selectedDateRange.split(' - ')[1]) : dateRange?.to;


    if (!datesToDeleteFrom || !datesToDeleteTo) {
      toast({
        title: 'Error',
        description: 'Please select a date range to delete.',
        variant: 'destructive',
      });
      return;
    }

    const updatedWageRecords = wageRecords.filter(record => {
        // Filter out records that match the selected date range exactly
        return !(record.dateFrom.getTime() === datesToDeleteFrom.getTime() && record.dateTo.getTime() === datesToDeleteTo.getTime());
    });

    localStorage.setItem('wageRecords', JSON.stringify(updatedWageRecords));
    setWageRecords(updatedWageRecords);
    setFilteredWageRecords([]); // Clear filtered records after deletion
    setSelectedDateRange(null); // Clear selected date range display

    toast({
      title: 'Success',
      description: 'Wage records for the selected date range deleted successfully!',
    });

    // FIX: Change null to undefined when resetting dateRange state
    setDateRange({from: undefined, to: undefined}); // Changed from null
    setDeletePassword('');
  };

  const exportToCSV = (type: string) => {
    if (!selectedDateRange) {
      toast({
        title: 'Error',
        description: 'Please select a pay period from the table before exporting.',
        variant: 'destructive',
      });
      return;
    }

    // Use filteredWageRecords as the source for export
    const wageRecordsToExport = filteredWageRecords.filter(record => {
      const employee = employees.find(emp => emp.id === record.employeeId);
      return employee?.paymentMethod === 'online';
    });


    if (!wageRecordsToExport || wageRecordsToExport.length === 0) {
      toast({
        title: 'Error',
        description: `No online transfer employees found for the selected pay period for ${type} export.`,
        variant: 'default', // Use default for info
      });
      return;
    }

    let csvData = '';

    if (type === 'BSP') {
      const csvRows: string[] = []; // Explicitly type as string array

      wageRecordsToExport.forEach(record => {
        const employeeDetails = employees.find(emp => emp.id === record.employeeId);
        csvRows.push([
          employeeDetails?.bankCode || '',
          employeeDetails?.bankAccountNumber || '',
          record.netPay.toFixed(2), // .toFixed returns string
          'Salary',
          record.employeeName,
        ].join(','));
      });

      csvData = csvRows.join('\n');
    } else if (type === 'BRED') {
      const csvRows: string[] = []; // Explicitly type as string array
       // Add headers for BRED format
      csvRows.push([
           'BIC',
           'Employee',
           'Employee', // Empty column as per previous example
           'Account N',
           'Amount',
           'Purpose of Note (optional)',
      ].join(','));

      wageRecordsToExport.forEach(record => {
        const employeeDetails = employees.find(emp => emp.id === record.employeeId);
        csvRows.push([
          employeeDetails?.bankCode || '',
          record.employeeName,
          '', // Empty column as per previous example
          employeeDetails?.bankAccountNumber || '',
          record.netPay.toFixed(2), // .toFixed returns string
          'Salary',
        ].join(','));
      });

      csvData = csvRows.join('\n');
    } else {
         toast({
              title: 'Error',
              description: 'Invalid export type specified.',
              variant: 'destructive',
          });
          return;
     }


    const blob = new Blob([csvData], {type: 'text/csv;charset=utf-8;'}); // Added charset
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // Dynamic filename based on selected date range and type
    const [from, to] = selectedDateRange.split(' - ');
    const filename = `wage_records_${type}_${format(new Date(from), 'yyyyMMdd')}_${format(new Date(to), 'yyyyMMdd')}.csv`;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up

    toast({
      title: 'Success',
      description: `Wage records exported to CSV (${type}) successfully!`,
    });
  };

  const handleExportToBSPCsv = () => exportToCSV('BSP');
  const handleExportToBREDCsv = () => exportToCSV('BRED');

  // Group wage records by pay period string
  const groupedWageRecords = wageRecords.reduce((acc: {[key: string]: {records: WageRecord[], totalWages: number}}, record) => {
    const payPeriod = `${format(record.dateFrom, 'MMM dd, yyyy')} - ${format(record.dateTo, 'MMM dd, yyyy')}`;
    if (!acc[payPeriod]) {
      acc[payPeriod] = {
        records: [],
        totalWages: 0,
      };
    }
    acc[payPeriod].records.push(record);
    acc[payPeriod].totalWages += record.netPay;
    return acc;
  }, {});


  const handleLogout = () => {
    router.push("/");
  };

  return (
    <div className="relative flex flex-col items-center min-h-screen text-white font-sans">
      {/* Background Image */}
      <Image
        src="/red-and-black-gaming-wallpapers-top-red-and-black-lightning-dark-gamer.jpg"
        alt="Background Image"
        layout="fill"
        objectFit="cover"
        className="absolute inset-0 w-full h-full -z-10"
        priority
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 w-full h-full bg-black/70 -z-9" />

      {/* Content Area */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col flex-grow">

        {/* Header Section */}
        <header className="w-full py-4 flex justify-between items-center border-b border-white/20 mb-6">
          <Link href="/wages" className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-gray-200 hover:bg-white/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="text-sm">Back to Wages</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-semibold text-center text-gray-100">
            Lal's Motor Winders - Wage Records
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-red-400 hover:bg-white/10 hover:text-red-300"
            aria-label="Logout"
          >
            <Power className="h-5 w-5" />
            <span className="sr-only">Logout</span>
          </Button>
        </header>

        {/* Main Content */}
        <Card className="w-full bg-black/50 backdrop-blur-sm border border-white/20 rounded-xl shadow-xl mb-8 flex-grow">
          <CardHeader>
            <CardTitle className="text-white text-center">Wage Records Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border border-white/20 rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-white/10">
                  <TableRow>
                    <TableHead className="text-white border-white/20">Pay Period</TableHead>
                    <TableHead className="text-white border-white/20">Total Wages</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Sort pay periods in descending order (most recent first) */}
                  {Object.entries(groupedWageRecords)
                    .sort(([payPeriodA], [payPeriodB]) => {
                       // Simple date comparison based on the 'from' date in the string
                       const dateA = new Date(payPeriodA.split(' - ')[0]);
                       const dateB = new Date(payPeriodB.split(' - ')[0]);
                       return dateB.getTime() - dateA.getTime();
                    })
                    .map(([payPeriod, data]: [string, any]) => (
                    <TableRow
                      key={payPeriod}
                      onClick={() => setSelectedDateRange(payPeriod)}
                      className={cn(
                        "cursor-pointer border-white/10 hover:bg-white/5",
                        selectedDateRange === payPeriod && "bg-white/10" // Highlight selected row
                      )}
                    >
                      <TableCell className="font-medium text-white border-white/20">{payPeriod}</TableCell>
                      <TableCell className="text-white border-white/20">${data.totalWages.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {selectedDateRange && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-white mb-4">Wage Details for {selectedDateRange}</h3>
                <div className="border border-white/20 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-white/10">
                      <TableRow>
                        <TableHead className="text-white border-white/20">Employee</TableHead>
                        <TableHead className="text-white border-white/20">Bank Code</TableHead>
                        <TableHead className="text-white border-white/20">Account #</TableHead>
                        <TableHead className="text-white border-white/20">Hourly Wage</TableHead>
                        <TableHead className="text-white border-white/20">Hours</TableHead>
                        <TableHead className="text-white border-white/20">FNPF</TableHead>
                        <TableHead className="text-white border-white/20">Deductions</TableHead>
                        <TableHead className="text-white border-white/20">Gross Pay</TableHead>
                        <TableHead className="text-white border-white/20">Net Pay</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredWageRecords.map((record) => (
                        <TableRow key={record.employeeId} className="border-white/10 hover:bg-white/5">
                          <TableCell className="text-white border-white/20">{record.employeeName}</TableCell>
                          <TableCell className="text-white border-white/20">
                            {employees.find(emp => emp.id === record.employeeId)?.bankCode || 'N/A'}
                          </TableCell>
                          <TableCell className="text-white border-white/20">
                            {employees.find(emp => emp.id === record.employeeId)?.bankAccountNumber || 'N/A'}
                          </TableCell>
                          <TableCell className="text-white border-white/20">${record.hourlyWage.toFixed(2)}</TableCell>
                          <TableCell className="text-white border-white/20">{record.hoursWorked.toFixed(2)}</TableCell>
                          <TableCell className="text-white border-white/20">${record.fnpfDeduction.toFixed(2)}</TableCell>
                          <TableCell className="text-white border-white/20">${record.otherDeductions.toFixed(2)}</TableCell>
                          <TableCell className="text-white border-white/20">${record.grossPay.toFixed(2)}</TableCell>
                          <TableCell className="text-white border-white/20">${record.netPay.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex flex-wrap gap-3 mt-6 justify-center">
                  <Button
                    variant="secondary" // Changed to secondary for consistency
                    size="lg"
                    onClick={handleExportToBSPCsv}
                    className="min-w-[150px] hover:bg-gray-700/80" // Added hover style
                  >
                    Export BSP CSV
                  </Button>
                  <Button
                    variant="secondary" // Changed to secondary for consistency
                    size="lg"
                    onClick={handleExportToBREDCsv}
                    className="min-w-[150px] hover:bg-gray-700/80" // Added hover style
                  >
                    Export BRED CSV
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="min-w-[150px]">
                        Delete Records
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-gray-900 border-white/20 text-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-300">
                          Are you sure you want to delete the wage records for the selected date range ({selectedDateRange})? This action cannot be undone.
                          Please enter the admin password to confirm.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="grid gap-2">
                        <Label htmlFor="password" className="text-gray-300">Admin Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={deletePassword}
                          onChange={e => setDeletePassword(e.target.value)}
                          className="bg-gray-800 border-white/20 text-white"
                          onKeyPress={(e) => { // Allow confirming with Enter key
                            if (e.key === 'Enter') {
                                // FIX: Call handleDeleteRecords instead of confirmSaveWages
                                handleDeleteRecords();
                                // Manually close the dialog if needed, depending on AlertDialog implementation
                                // document.getElementById('adminPasswordDialog')?.dispatchEvent(new MouseEvent('click'));
                            }
                          }}
                        />
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">
                          Cancel
                        </AlertDialogCancel>
                        {/* Changed AlertDialogAction to call handleDeleteRecords */}
                        <AlertDialogAction
                          onClick={handleDeleteRecords}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WagesRecordsPage;

