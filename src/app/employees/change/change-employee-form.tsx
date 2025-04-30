'use client'; // Mark as Client Component

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// Image is not needed here as it will be in the parent Server Component
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation'; // useSearchParams and useRouter are client hooks
// Import getEmployees and updateEmployee from your service
// Note: If employee-service.ts is 'use server', you cannot directly import
// and call its functions from a client component. You would need to use
// Server Actions or an API route.
// Given your original code used localStorage, I will replicate that here
// to keep the client-side data handling consistent with your previous implementation.
// If you intend to use the 'use server' employee-service, you will need
// to adapt this component to use Server Actions to interact with it.
// import { getEmployees, updateEmployee } from '@/services/employee-service'; // Remove server service import


import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link'; // Link is a client component
import { ArrowLeft, Home } from 'lucide-react'; // Lucide icons are fine in client components

// Re-define the Employee interface if not imported from a shared types file
// Assuming it's not imported, define it here for this component's scope
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


const ChangeEmployeeForm = () => { // Renamed the component
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [hourlyWage, setHourlyWage] = useState('');
  const [fnpfNo, setFnpfNo] = useState('');
  const [tinNo, setTinNo] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online'>('cash');
  const [branch, setBranch] = useState<'labasa' | 'suva'>('labasa');
  const [fnpfEligible, setFnpfEligible] = useState(true);
  const { toast } = useToast();
  const router = useRouter(); // Client hook
  const searchParams = useSearchParams(); // Client hook

  useEffect(() => {
    const employeeIdFromParams = searchParams.get('id');
    if (employeeIdFromParams) {
      setSelectedEmployeeId(employeeIdFromParams);
    }
  }, [searchParams]);

  useEffect(() => {
    // Fetch employees from localStorage in this client component
    const storedEmployees = localStorage.getItem('employees');
    if (storedEmployees) {
      try {
        setEmployees(JSON.parse(storedEmployees));
      } catch (error: any) {
         toast({
           title: 'Error',
           description: error.message || 'Failed to parse employees from storage.',
           variant: 'destructive',
         });
         setEmployees([]); // Ensure employees state is an array on error
      }
    } else {
        setEmployees([]); // Ensure employees state is an array if storage is empty
    }
  }, [toast]); // Depend on toast

  useEffect(() => {
    if (selectedEmployeeId && employees.length > 0) { // Ensure employees are loaded
      const employeeToChange = employees.find(
        (emp) => emp.id === selectedEmployeeId
      );
      if (employeeToChange) {
        setName(employeeToChange.name);
        setPosition(employeeToChange.position);
        setHourlyWage(employeeToChange.hourlyWage);
        setFnpfNo(employeeToChange.fnpfNo);
        setTinNo(employeeToChange.tinNo);
        setBankCode(employeeToChange.bankCode);
        setBankAccountNumber(employeeToChange.bankAccountNumber);
        setPaymentMethod(employeeToChange.paymentMethod);
        setBranch(employeeToChange.branch);
        setFnpfEligible(employeeToChange.fnpfEligible);
      } else {
         // Handle case where employee ID from params is not found
         toast({
            title: 'Error',
            description: 'Employee not found.',
            variant: 'destructive',
         });
         // Optionally redirect the user or clear selectedEmployeeId
         setSelectedEmployeeId('');
      }
    } else if (!selectedEmployeeId && employees.length > 0) {
        // If employees loaded but no ID in params, clear form
        setName('');
        setPosition('');
        setHourlyWage('');
        setFnpfNo('');
        setTinNo('');
        setBankCode('');
        setBankAccountNumber('');
        setPaymentMethod('cash');
        setBranch('labasa');
        setFnpfEligible(true);
    }
  }, [selectedEmployeeId, employees, toast]); // Depend on selectedEmployeeId, employees, and toast

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedEmployeeId) {
        toast({
            title: 'Error',
            description: 'No employee selected to update.',
            variant: 'destructive',
        });
        return;
    }

    if (!name || !position || !hourlyWage) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields (Name, Position, Hourly Wage).',
        variant: 'destructive',
      });
      return;
    }

    if (fnpfEligible && !fnpfNo) {
      toast({
        title: 'Error',
        description: 'Please fill in FNPF No when FNPF Eligible is checked.',
        variant: 'destructive',
      });
      return;
    }

    if (paymentMethod === 'online' && (!bankCode || !bankAccountNumber)) {
      toast({
        title: 'Error',
        description:
          'Please fill in Bank Code and Account Number for online transfer.',
        variant: 'destructive',
      });
      return;
    }

    const wageAsNumber = parseFloat(hourlyWage);
    if (isNaN(wageAsNumber) || wageAsNumber < 0) {
      toast({
        title: 'Error',
        description: 'Hourly Wage must be a valid non-negative number.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const updatedEmployee: Employee = {
        id: selectedEmployeeId, // Use the selected ID
        name,
        position,
        hourlyWage,
        fnpfNo,
        tinNo,
        bankCode,
        bankAccountNumber,
        paymentMethod,
        branch,
        fnpfEligible,
      };

      // Update employee in localStorage
      const updatedEmployees = employees.map((employee) =>
        employee.id === updatedEmployee.id ? updatedEmployee : employee
      );
      localStorage.setItem('employees', JSON.stringify(updatedEmployees));
      setEmployees(updatedEmployees); // Update local state

      toast({
        title: 'Success',
        description: 'Employee information updated successfully!',
      });

      // Clear form after successful update
      setSelectedEmployeeId(''); // Clear selected ID
      setName('');
      setPosition('');
      setHourlyWage('');
      setFnpfNo('');
      setTinNo('');
      setBankCode('');
      setBankAccountNumber('');
      setPaymentMethod('cash');
      setBranch('labasa');
      setFnpfEligible(true);

      // Optionally redirect after successful update
      // router.push('/employees/information'); // Uncomment if you want to redirect

      // Refetch employees to update the select dropdown (optional, state update above might be enough)
      // fetchEmployees(); // Uncomment if needed
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update employee information.',
        variant: 'destructive',
      });
    }
  };

  return (
    // The main div with background and overlay is in the parent Server Component
    // This component only renders the Card content
    <Card className="w-full max-w-md bg-transparent backdrop-blur-md shadow-lg rounded-lg border border-accent/40">
      <CardHeader className="relative">
        <Link href="/employees" className="absolute top-2 left-2">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <CardTitle className="text-2xl text-white text-center">
          Change Employee Information
        </CardTitle>
        <Link href="/dashboard" className="absolute top-2 right-2">
          <Button variant="ghost" size="icon">
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="employee" className="text-white">
              Select Employee
            </Label>
            <Select
              onValueChange={setSelectedEmployeeId}
              value={selectedEmployeeId} // Use value instead of defaultValue for controlled component
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2 mt-4"> {/* Added margin top */}
            <Label className="text-white">Select Branch</Label>
            <RadioGroup
              onValueChange={(value) =>
                setBranch(value === 'labasa' ? 'labasa' : 'suva')
              }
              value={branch} // Use value for controlled component
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="labasa" id="r3" />
                <Label htmlFor="r3" className="text-white">
                  Labasa Branch
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="suva" id="r4" />
                <Label htmlFor="r4" className="text-white">
                  Suva Branch
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid gap-2 mt-4"> {/* Added margin top */}
            <Label htmlFor="name" className="text-white">
              Employee Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Employee Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white/10 text-white placeholder-gray-400 border-white/20" // Added styling
            />
          </div>
          <div className="grid gap-2 mt-4"> {/* Added margin top */}
            <Label htmlFor="position" className="text-white">
              Employee Position
            </Label>
            <Input
              id="position"
              type="text"
              placeholder="Employee Position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="bg-white/10 text-white placeholder-gray-400 border-white/20" // Added styling
            />
          </div>
          <div className="grid gap-2 mt-4"> {/* Added margin top */}
            <Label htmlFor="hourlyWage" className="text-white">
              Hourly Wage
            </Label>
            <Input
              id="hourlyWage"
              type="number"
              placeholder="Hourly Wage"
              value={hourlyWage}
              onChange={(e) => setHourlyWage(e.target.value)}
              className="bg-white/10 text-white placeholder-gray-400 border-white/20" // Added styling
            />
          </div>

          <div className="grid gap-2 mt-4"> {/* Added margin top */}
            <Label htmlFor="tinNo" className="text-white">
              TIN No
            </Label>
            <Input
              id="tinNo"
              type="text"
              placeholder="TIN No"
              value={tinNo}
              onChange={(e) => setTinNo(e.target.value)}
              className="bg-white/10 text-white placeholder-gray-400 border-white/20" // Added styling
            />
          </div>

          <div className="flex items-center space-x-2 mt-4">
            <Checkbox
              id="fnpfEligible"
              checked={fnpfEligible}
              onCheckedChange={(checked) => {
                if (checked !== 'indeterminate') {
                  setFnpfEligible(checked);
                }
              }}
              className="border-white/20 text-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground" // Adjusted styling
            />
            <Label
              htmlFor="fnpfEligible"
              className="text-white cursor-pointer"
            >
              Eligible for FNPF Deduction
            </Label>
          </div>

          {fnpfEligible && (
            <div className="grid gap-2 mt-4"> {/* Added margin top */}
              <Label htmlFor="fnpfNo" className="text-white">
                FNPF No
              </Label>
              <Input
                id="fnpfNo"
                type="text"
                placeholder="FNPF No"
                value={fnpfNo}
                onChange={(e) => setFnpfNo(e.target.value)}
                className="bg-white/10 text-white placeholder-gray-400 border-white/20" // Added styling
              />
            </div>
          )}

          <div className="grid gap-2 mt-4"> {/* Added margin top */}
            <Label className="text-white">Payment Method</Label>
            <RadioGroup
              onValueChange={(value) =>
                setPaymentMethod(value === 'cash' ? 'cash' : 'online')
              }
              value={paymentMethod} // Use value for controlled component
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cash" id="r1" />
                <Label htmlFor="r1" className="text-white">
                  Cash Wages
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="online" id="r2" />
                <Label htmlFor="r2" className="text-white">
                  Online Transfer
                </Label>
              </div>
            </RadioGroup>
          </div>

          {paymentMethod === 'online' && (
            <>
              <div className="grid gap-2 mt-4"> {/* Added margin top */}
                <Label htmlFor="bankCode" className="text-white">
                  Bank Code
                </Label>
                <Select
                  onValueChange={setBankCode}
                  value={bankCode} // Use value for controlled component
                >
                  <SelectTrigger className="bg-white/10 text-white placeholder-gray-400 border-white/20">
                    <SelectValue placeholder="Select Bank Code" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ANZ">ANZ</SelectItem>
                    <SelectItem value="BSP">BSP</SelectItem>
                    <SelectItem value="BOB">BOB</SelectItem>
                    <SelectItem value="HFC">HFC</SelectItem>
                    <SelectItem value="BRED">BRED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2 mt-4"> {/* Added margin top */}
                <Label htmlFor="bankAccountNumber" className="text-white">
                  Bank Account Number
                </Label>
                <Input
                  id="bankAccountNumber"
                  type="text"
                  placeholder="Bank Account Number"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  className="bg-white/10 text-white placeholder-gray-400 border-white/20" // Added styling
                />
              </div>
            </>
          )}

          <Button className="w-full mt-6" type="submit" variant="secondary"> {/* Changed variant for consistency */}
            Update Employee Information
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChangeEmployeeForm; // Export the form component
