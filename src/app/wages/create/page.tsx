'use client';

import {useState, useEffect} from 'react';
import Image from 'next/image';
import Link from "next/link"; // Import Link
import {useToast} from '@/hooks/use-toast';
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
import {CalendarIcon, ArrowLeft, Home} from 'lucide-react';
import {DateRange} from 'react-day-picker'; // Assuming DateRange from react-day-picker
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
import * as XLSX from 'xlsx';

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

interface WageRecord {
  employeeId: string;
  employeeName: string;
  hourlyWage: number;
  hoursWorked: number;
    mealAllowance: number;
  fnpfDeduction: number;
  otherDeductions: number;
  grossPay: number;
  netPay: number;
  dateFrom: Date;
  dateTo: Date;
}

const CreateWagesPage = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [wageData, setWageData] = useState<{[employeeId: string]: {hoursWorked: string; mealAllowance: string; otherDeductions: string}}>({});
  const {toast} = useToast();
  // FIX: Change null to undefined for initial state
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined, // Changed from null
    to: undefined,   // Changed from null
  });
  const [totalNetWages, setTotalNetWages] = useState<number>(0);
  const [totalFnpfDeduction, setTotalFnpfDeduction] = useState<number>(0);
  const [totalSuvaWages, setTotalSuvaWages] = useState<number>(0);
  const [totalLabasaWages, setTotalLabasaWages] = useState<number>(0);
  const [totalCashWages, setTotalCashWages] = useState<number>(0);
    const [deletePassword, setDeletePassword] = useState('');
    // WARNING: Hardcoded password is not secure. Store this securely in a real application.
    const ADMIN_PASSWORD = 'admin';


  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    // Using localStorage as per your code. In a real app, fetch from a backend.
    try {
        const storedEmployees = localStorage.getItem('employees');
          if (storedEmployees) {
              setEmployees(JSON.parse(storedEmployees));
          } else {
              setEmployees([]); // Ensure employees state is an array even if storage is empty
          }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch employees.',
        variant: 'destructive',
      });
       setEmployees([]); // Ensure employees state is an array on error
    }
  };

  // Initialize wageData when employees are loaded or change
  useEffect(() => {
    const initialWageData: {[employeeId: string]: {hoursWorked: string; mealAllowance: string; otherDeductions: string}} = {};
    employees.forEach(employee => {
      // Preserve existing wageData for an employee if it exists
      initialWageData[employee.id] = wageData[employee.id] || { hoursWorked: '', mealAllowance: '', otherDeductions: '' };
    });
    setWageData(initialWageData);
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employees]); // Depend on employees

  // Calculate totals whenever wageData changes
  useEffect(() => {
    calculateTotals();
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wageData, employees]); // Depend on wageData and employees

  const handleHoursWorkedChange = (employeeId: string, hoursWorked: string) => {
    setWageData(prev => ({
      ...prev,
      [employeeId]: {...prev[employeeId], hoursWorked},
    }));
  };

    const handleMealAllowanceChange = (employeeId: string, mealAllowance: string) => {
        setWageData(prev => ({
            ...prev,
            [employeeId]: {...prev[employeeId], mealAllowance},
        }));
    };


  const handleOtherDeductionsChange = (employeeId: string, otherDeductions: string) => {
    setWageData(prev => ({
      ...prev,
      [employeeId]: {...prev[employeeId], otherDeductions},
    }));
  };

    // Helper function to calculate wages for a single employee
    const calculateEmployeeWage = (employee: Employee) => {
          const hourlyWage = parseFloat(employee.hourlyWage);
          const hoursWorked = parseFloat(wageData[employee.id]?.hoursWorked || '0');
          const mealAllowance = parseFloat(wageData[employee.id]?.mealAllowance || '0');
          const otherDeductions = parseFloat(wageData[employee.id]?.otherDeductions || '0');

          const grossPay = (hourlyWage * hoursWorked) + mealAllowance;
          let fnpfDeduction = 0;
          if(employee.fnpfEligible && !isNaN(grossPay)){ // Ensure grossPay is a number
              fnpfDeduction = grossPay * 0.08;
          }
          // Ensure deductions are not more than gross pay after FNPF
          const netPay = Math.max(0, grossPay - fnpfDeduction - otherDeductions); // Net pay cannot be negative


          return {
            employeeId: employee.id,
            employeeName: employee.name,
            hourlyWage,
            hoursWorked,
              mealAllowance,
            fnpfDeduction,
            otherDeductions,
            grossPay,
            netPay,
            branch: employee.branch,
            paymentMethod: employee.paymentMethod,
            fnpfEligible: employee.fnpfEligible,
          };
        };


  const calculateTotals = () => {
    let totalNet = 0;
    let totalFnpf = 0;
    let totalSuva = 0;
    let totalLabasa = 0;
    let totalCash = 0;

    employees.forEach(employee => {
      const wageDetails = calculateEmployeeWage(employee); // Use the helper
      if (wageDetails && !isNaN(wageDetails.netPay)) { // Ensure netPay is a number before adding
        totalNet += wageDetails.netPay;
        totalFnpf += wageDetails.fnpfDeduction;

        if (wageDetails.branch === 'suva') {
          totalSuva += wageDetails.netPay;
        } else if (wageDetails.branch === 'labasa') {
          totalLabasa += wageDetails.netPay;
        }

        if (wageDetails.paymentMethod === 'cash') {
          totalCash += wageDetails.netPay;
        }
      }
    });

    setTotalNetWages(totalNet);
    setTotalFnpfDeduction(totalFnpf);
    setTotalSuvaWages(totalSuva);
    setTotalLabasaWages(totalLabasa);
    setTotalCashWages(totalCash);
  };

    // Helper function to get current wage records from state
    const getCurrentWageRecords = (): WageRecord[] => {
          const records: WageRecord[] = [];
          if (!dateRange?.from || !dateRange?.to) {
              // Should not happen if called after date range check, but safety first
              toast({
                  title: 'Error',
                  description: 'Date range missing for recording wages.',
                  variant: 'destructive',
              });
              return [];
          }
          employees.forEach(employee => {
              const wageDetails = calculateEmployeeWage(employee);
              if (wageDetails) {
                  records.push({
                      ...wageDetails,
                      dateFrom: dateRange.from!,
                      dateTo: dateRange.to!,
                  });
              }
          });
          return records;
        };

    // Helper function to save records to local storage
    const saveWageRecordsToStorage = (recordsToSave: WageRecord[], existingRecords: WageRecord[]) => {
          const updatedWageRecords = [...existingRecords, ...recordsToSave];
          localStorage.setItem('wageRecords', JSON.stringify(updatedWageRecords));

          toast({
              title: 'Success',
              description: 'Wages calculated and recorded successfully!',
          });

          // FIX: Clear inputs and date range after successful save - Change null to undefined
          setDateRange({ from: undefined, to: undefined }); // Changed from null
          const initialWageData: {[employeeId: string]: {hoursWorked: string; mealAllowance: string; otherDeductions: string}} = {};
          employees.forEach(employee => {
              initialWageData[employee.id] = { hoursWorked: '', mealAllowance: '', otherDeductions: '' };
          });
          setWageData(initialWageData);
        };

  const handleSaveWages = () => { // Renamed to be more explicit
    if (!dateRange?.from || !dateRange?.to) {
      toast({
        title: 'Error',
        description: 'Please select a date range.',
        variant: 'destructive',
      });
      return;
    }

      const recordsToSave = getCurrentWageRecords();

      if (recordsToSave.length === 0) {
            toast({
                 title: 'Info',
                 description: 'No employee data available to save wages.',
                 variant: 'default', // Use default variant for info
            });
            return;
      }


    const storedWageRecords = localStorage.getItem('wageRecords');
    const existingWageRecords: WageRecord[] = storedWageRecords
      ? JSON.parse(storedWageRecords)
      : [];

    // Check if wage records already exist for this date range
    const existingRecordsForDateRange = existingWageRecords.filter(record => {
        const recordDateFrom = new Date(record.dateFrom);
        const recordDateTo = new Date(record.dateTo);
      return (
        recordDateFrom.getTime() === dateRange.from!.getTime() &&
        recordDateTo.getTime() === dateRange.to!.getTime()
      );
    });

    if (existingRecordsForDateRange.length > 0) {
        // If records exist, trigger the AlertDialog for confirmation to overwrite/update
        document.getElementById('adminPasswordDialog')?.click();
    } else {
      // If no records exist for this date range, save directly
      saveWageRecordsToStorage(recordsToSave, existingWageRecords);
    }
  };

  const confirmSaveWages = () => { // Renamed to be more explicit
    if (deletePassword !== ADMIN_PASSWORD) {
      toast({
        title: 'Error',
        description: 'Incorrect password. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    if (!dateRange?.from || !dateRange?.to) {
      toast({
        title: 'Error',
        description: 'Date range is missing for update.',
        variant: 'destructive',
      });
      return;
    }

      const recordsToSave = getCurrentWageRecords();

        if (recordsToSave.length === 0) {
             toast({
                   title: 'Info',
                   description: 'No employee data available to update wages.',
                   variant: 'default',
             });
              // Close the dialog manually if no records to save
              document.getElementById('adminPasswordDialog')?.dispatchEvent(new MouseEvent('click'));
            return;
        }

    // Load existing wage records from local storage
    const storedWageRecords = localStorage.getItem('wageRecords');
    const existingWageRecords: WageRecord[] = storedWageRecords
      ? JSON.parse(storedWageRecords)
      : [];

    // Filter out existing records for the selected date range
    const updatedWageRecords = existingWageRecords.filter(record => {
        const recordDateFrom = new Date(record.dateFrom);
        const recordDateTo = new Date(record.dateTo);

        return !(recordDateFrom.getTime() === dateRange.from!.getTime() &&
                 recordDateTo.getTime() === dateRange.to!.getTime());
    });

    // Add the new wage records to the filtered existing records
    const finalWageRecords = [...updatedWageRecords, ...recordsToSave];

    localStorage.setItem('wageRecords', JSON.stringify(finalWageRecords));

    toast({
      title: 'Success',
      description: 'Wage records updated successfully!',
    });

    // FIX: Clear the date range and password after successful update - Change null to undefined
    setDateRange({from: undefined, to: undefined}); // Changed from null
    setDeletePassword('');
      // Reset wageData inputs as well
      const initialWageData: {[employeeId: string]: {hoursWorked: string; mealAllowance: string; otherDeductions: string}} = {};
       employees.forEach(employee => {
           initialWageData[employee.id] = { hoursWorked: '', mealAllowance: '', otherDeductions: '' };
       });
       setWageData(initialWageData);
  };

    const exportToCSV = (type: string) => {
         if (!dateRange?.from || !dateRange?.to) {
             toast({
                 title: 'Error',
                 description: 'Please select a date range before exporting.',
                 variant: 'destructive',
             });
             return;
         }

          const wageRecords = getCurrentWageRecords();

          if (!wageRecords || wageRecords.length === 0) {
              toast({
                  title: 'Error',
                  description: 'No wage records calculated to export.',
                  variant: 'destructive',
              });
              return;
          }


         let csvData = '';

         if (type === 'BSP') {
             // FIX: Explicitly type csvRows as string[]
             const csvRows: string[] = [];

             // Filter for online transfer employees
             const onlineTransferRecords = wageRecords.filter(record => {
                 const employee = employees.find(emp => emp.id === record.employeeId);
                 return employee?.paymentMethod === 'online';
             });

               if (onlineTransferRecords.length === 0) {
                   toast({
                        title: 'Info',
                        description: `No online transfer employees for ${type} export.`,
                        variant: 'default',
                   });
                   return;
               }

             // Add records
             onlineTransferRecords.forEach(record => {
                 const employeeDetails = employees.find(emp => emp.id === record.employeeId);
                 // Ensure all values pushed are strings or explicitly converted
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
             // FIX: Explicitly type csvRows as string[]
             const csvRows: string[] = [];
             // Add headers
            csvRows.push([
                 'BIC',
                 'Employee',
                 'Employee',
                 'Account N',
                 'Amount',
                 'Purpose of Note (optional)',
            ].join(','));

             // Filter for online transfer employees
             const onlineTransferRecords = wageRecords.filter(record => {
                 const employee = employees.find(emp => emp.id === record.employeeId);
                 return employee?.paymentMethod === 'online';
             });

             if (onlineTransferRecords.length === 0) {
                 toast({
                        title: 'Info',
                        description: `No online transfer employees for ${type} export.`,
                        variant: 'default',
                    });
                 return;
             }


             // Add records for online transfer employees
             onlineTransferRecords.forEach(record => {
                 const employeeDetails = employees.find(emp => emp.id === record.employeeId);
                  // Ensure all values pushed are strings or explicitly converted
                 csvRows.push([
                     employeeDetails?.bankCode || '',
                     record.employeeName,
                     '', // Empty Employee 2 Column
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


         const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' }); // Added charset
         const url = URL.createObjectURL(blob);
         const link = document.createElement('a');
         link.href = url;
         link.setAttribute('download', `wage_records_${type}_${format(dateRange.from!, 'yyyyMMdd')}_${format(dateRange.to!, 'yyyyMMdd')}.csv`); // Dynamic filename
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
         URL.revokeObjectURL(url); // Clean up

         toast({
             title: 'Success',
             description: `Wage records exported to CSV (${type}) successfully!`,
         });
     };


    const handleExportToExcel = () => {
         if (!dateRange?.from || !dateRange?.to) {
             toast({
                 title: 'Error',
                 description: 'Please select a date range before exporting.',
                 variant: 'destructive',
             });
             return;
         }

          const wageRecords = getCurrentWageRecords();

          if (!wageRecords || wageRecords.length === 0) {
              toast({
                  title: 'Error',
                  description: 'No wage records calculated to export.',
                  variant: 'destructive',
              });
              return;
          }

         // Prepare data for Excel
         const excelData = [
             [
                 'Employee Name',
                 'Hourly Wage',
                 'Hours Worked',
                 'Meal Allowance',
                 'FNPF Deduction',
                 'Other Deductions',
                 'Gross Pay',
                 'Net Pay',
                 'Date From',
                 'Date To',
             ],
             ...wageRecords.map(record => [
                 record.employeeName,
                 record.hourlyWage,
                 record.hoursWorked,
                 record.mealAllowance,
                 record.fnpfDeduction,
                 record.otherDeductions,
                 record.grossPay,
                 record.netPay,
                 format(record.dateFrom, 'yyyy-MM-dd'),
                 format(record.dateTo, 'yyyy-MM-dd'),
             ]),
              // Add totals row
              [
                  'Totals',
                  '', // Hourly Wage Total (N/A)
                  '', // Hours Worked Total (N/A)
                  '', // Meal Allowance Total (N/A)
                  totalFnpfDeduction.toFixed(2),
                   // Assuming total other deductions is total gross pay minus total net pay minus total FNPF
                  (totalNetWages > 0 ? (totalNetWages + totalFnpfDeduction - totalNetWages) : 0).toFixed(2), // Simple Other Deductions Total (approximation)
                   (totalNetWages > 0 ? (totalNetWages + totalFnpfDeduction) : 0).toFixed(2), // Simple Gross Pay Total (approximation)
                  totalNetWages.toFixed(2),
                  '', // Date From (N/A)
                  '', // Date To (N/A)
              ],
         ];

         // Create workbook and add data
         const wb = XLSX.utils.book_new();
         const ws = XLSX.utils.aoa_to_sheet(excelData);

         XLSX.utils.book_append_sheet(wb, ws, 'Wage Records');

         // Generate Excel file and trigger download
         XLSX.writeFile(wb, `wage_records_${format(dateRange.from!, 'yyyyMMdd')}_${format(dateRange.to!, 'yyyyMMdd')}.xlsx`); // Dynamic filename


         toast({
             title: 'Success',
             description: 'Wage records exported to Excel successfully!',
         });
     };


  return (
    <div className="relative flex flex-col items-center min-h-screen text-white font-sans">
      {/* Background Image */}
      <Image
        src="/red-and-black-gaming-wallpapers-top-red-and-black-lightning-dark-gamer.jpg" // Use the desired background
        alt="Background Image"
        layout="fill"
        objectFit="cover"
        className="absolute inset-0 w-full h-full -z-10"
        priority
      />

      {/* Overlay - Matching opacity */}
      <div className="absolute inset-0 w-full h-full bg-black/60 -z-9" />

      {/* Content Area */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col flex-grow items-center">

        {/* Header (Matching style) */}
        <header className="w-full py-4 flex justify-between items-center border-b border-white/20 mb-8 sm:mb-10 md:mb-12">
          <Link href="/wages" passHref> {/* Link back to the wages management main page */}
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to Wages Management</span>
            </Button>
          </Link>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-center text-gray-100">
            Calculate Wages
          </h1>
          <Link href="/dashboard" passHref> {/* Link back to the main dashboard */}
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Home className="h-5 w-5" />
              <span className="sr-only">Dashboard</span>
            </Button>
          </Link>
        </header>

        {/* Main Content - Card containing Date Picker, Table, Buttons, Totals */}
        <main className="flex flex-col items-center flex-grow w-full pb-16">
          {/* Card Container */}
          <div className="w-full max-w-5xl bg-black/40 backdrop-blur-sm border border-white/20 rounded-xl p-8 shadow-xl">

            {/* Date Picker */}
            <div className="mb-6">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-[300px] justify-start text-left font-normal text-gray-900 bg-white hover:bg-gray-100', // Adjust button style
                      !dateRange?.from && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        `${format(dateRange.from, 'MMM dd,')} - ${format(
                          dateRange.to,
                          'MMM dd,'
                        )}`
                      ) : (
                        format(dateRange.from, 'MMM dd,')
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 bg-white text-black" // Adjust popover content style
                  align="start"
                  side="bottom"
                >
                  <Calendar
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    disabled={{
                      before: new Date(new Date().setDate(new Date().getDate() - 365)),
                      after: new Date(),
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Wage Calculation Table */}
            <div className="overflow-x-auto mb-6">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-white/10">
                    <TableHead className="text-white">Employee Name</TableHead>
                    <TableHead className="text-white">Bank Code</TableHead>
                    <TableHead className="text-white">Bank Account</TableHead>
                    <TableHead className="text-white">Hourly Wage</TableHead>
                    <TableHead className="text-white">Hours Worked</TableHead>
                    <TableHead className="text-white">Meal Allowance</TableHead>
                    <TableHead className="text-white">Other Deductions</TableHead>
                    <TableHead className="text-white">FNPF Deduction</TableHead>
                    <TableHead className="text-white">Net Pay</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map(employee => {
                      const wageDetails = calculateEmployeeWage(employee); // Use the helper
                      return (
                    <TableRow key={employee.id} className="hover:bg-white/10">
                      <TableCell className="text-white">{employee.name}</TableCell>
                      <TableCell className="text-white">{employee?.bankCode}</TableCell>
                      <TableCell className="text-white">{employee?.bankAccountNumber}</TableCell>
                      <TableCell className="text-white">${parseFloat(employee.hourlyWage || '0').toFixed(2)}</TableCell> {/* Handle potential empty string */}
                      <TableCell>
                        <Input
                          type="number"
                          placeholder="Hours"
                          value={wageData[employee.id]?.hoursWorked || ''}
                          onChange={e => handleHoursWorkedChange(employee.id, e.target.value)}
                          className="w-24 p-1 border rounded text-gray-900 bg-white"
                        />
                      </TableCell>
                        <TableCell>
                            <Input
                                type="number"
                                placeholder="Allowance"
                                value={wageData[employee.id]?.mealAllowance || ''}
                                onChange={e => handleMealAllowanceChange(employee.id, e.target.value)}
                                className="w-24 p-1 border rounded text-gray-900 bg-white"
                            />
                        </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          placeholder="Deductions"
                          value={wageData[employee.id]?.otherDeductions || ''}
                          onChange={e => handleOtherDeductionsChange(employee.id, e.target.value)}
                          className="w-24 p-1 border rounded text-gray-900 bg-white"
                        />
                      </TableCell>
                      <TableCell className="text-white">
                        $
                        {wageDetails?.fnpfEligible && wageDetails?.fnpfDeduction !== undefined && !isNaN(wageDetails?.fnpfDeduction) ? wageDetails?.fnpfDeduction.toFixed(2) : 'N/A'} {/* More robust check */}
                      </TableCell>
                      <TableCell className="text-white">
                        ${wageDetails?.netPay !== undefined && !isNaN(wageDetails?.netPay) ? wageDetails?.netPay.toFixed(2) : '0.00'} {/* More robust check */}
                      </TableCell>
                    </TableRow>
                          );
                      })}
                      {/* Total Wage Display Row */}
                      <TableRow className="font-bold hover:bg-white/10">
                        <TableCell colSpan={7} className="text-right text-white">
                          Total:
                        </TableCell>
                        <TableCell className="text-white">
                          ${totalFnpfDeduction.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-white">
                          ${totalNetWages.toFixed(2)}
                        </TableCell>
                      </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <Button variant="secondary" size="lg" onClick={handleSaveWages} className="hover:bg-gray-700/80">
                Save Wages
              </Button>
              <Button variant="secondary" size="lg" onClick={() => exportToCSV('BSP')} className="hover:bg-gray-700/80">
                Export to CSV (BSP)
              </Button>
              <Button variant="secondary" size="lg" onClick={() => exportToCSV('BRED')} className="hover:bg-gray-700/80">
                Export to CSV (BRED)
              </Button>
               <Button variant="secondary" size="lg" onClick={handleExportToExcel} className="hover:bg-gray-700/80">
                  Export to Excel
               </Button>
            </div>

            {/* Branch-wise Total Wage Display */}
            <div className="mt-6 pt-4 border-t border-white/20 text-center">
              <div className="text-lg text-white mb-2">
                Total Suva Branch Wages: ${totalSuvaWages.toFixed(2)}
              </div>
              <div className="text-lg text-white mb-2">
                Total Labasa Branch Wages: ${totalLabasaWages.toFixed(2)}
              </div>
              <div className="text-lg text-white">
                Total Cash Wages: ${totalCashWages.toFixed(2)}
              </div>
            </div>

          </div>
        </main>

        {/* AlertDialog for admin password - Keep outside main content flow */}
        <AlertDialog>
          <AlertDialogTrigger id="adminPasswordDialog" asChild>
            <Button variant="ghost" style={{display:"none"}}>Show Dialog</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Save/Update</AlertDialogTitle>
              <AlertDialogDescription>
                Wage records already exist for the selected date range.
                Please enter the admin password to confirm the save or update.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="grid gap-2">
              <Label htmlFor="password">Admin Password</Label>
              <Input
                id="password"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                  onKeyPress={(e) => { // Allow confirming with Enter key
                      if (e.key === 'Enter') {
                          confirmSaveWages();
                          // Manually close the dialog if needed, depending on AlertDialog implementation
                          // document.getElementById('adminPasswordDialog')?.dispatchEvent(new MouseEvent('click'));
                      }
                  }}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletePassword('')}>Cancel</AlertDialogCancel> {/* Clear password on cancel */}
              <AlertDialogAction onClick={confirmSaveWages}>
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </div>
  );
};

export default CreateWagesPage;
