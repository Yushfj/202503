'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { addEmployee } from '@/services/employee-service';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

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

const CreateEmployeePage = () => {
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
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    console.log('handleSubmit triggered!');
    event.preventDefault();

    if (!name || !position || !hourlyWage) {
      toast({
        title: 'Error',
        description: 'Please fill in Name, Position, and Hourly Wage.',
        variant: 'destructive',
      });
      console.log('Validation Failed: Missing required fields');
      return;
    }

    const wageAsNumber = parseFloat(hourlyWage);
    if (isNaN(wageAsNumber) || wageAsNumber < 0) {
      toast({
        title: 'Error',
        description: 'Hourly Wage must be a valid non-negative number.',
        variant: 'destructive',
      });
      console.log('Validation Failed: Invalid Hourly Wage format');
      return;
    }

    if (paymentMethod === 'online' && (!bankCode || !bankAccountNumber)) {
      toast({
        title: 'Error',
        description:
          'Please fill in Bank Code and Account Number for online transfer.',
        variant: 'destructive',
      });
      console.log('Validation Failed: Missing bank details for online payment');
      return;
    }

    try {
      const newEmployee: Employee = {
        id: '',
        name,
        position,
        hourlyWage,
        fnpfNo,
        tinNo,
        bankCode: paymentMethod === 'online' ? bankCode : '',
        bankAccountNumber: paymentMethod === 'online' ? bankAccountNumber : '',
        paymentMethod,
        branch,
        fnpfEligible,
      };

      console.log('Submitting employee data:', newEmployee);

      await addEmployee(newEmployee);

      toast({
        title: 'Success',
        description: 'Employee created successfully!',
      });

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

      router.push('/employees/information');
    } catch (error: any) {
      console.error('Error creating employee:', error);
      toast({
        title: 'Error Creating Employee',
        description:
          error.message ||
          'An unexpected error occurred. Check console for details.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen">
      <Image
        src="/red-and-black-gaming-wallpapers-top-red-and-black-lightning-dark-gamer.jpg"
        alt="Background Image"
        layout="fill"
        objectFit="cover"
        className="absolute top-0 left-0 w-full h-full -z-10"
        priority
      />

      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50 -z-9" />

      <Card className="w-full max-w-md bg-transparent backdrop-blur-md shadow-lg rounded-lg border border-accent/40 z-10">
        <CardHeader className="relative">
          <Link
            href="/employees"
            className="absolute top-4 left-4"
            aria-label="Back to Employees"
          >
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5 text-white" />
            </Button>
          </Link>
          <CardTitle className="text-2xl text-white text-center pt-2">
            New Employee
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label className="text-white font-semibold">Select Branch</Label>
              <RadioGroup
                onValueChange={(value) =>
                  setBranch(value === 'labasa' ? 'labasa' : 'suva')
                }
                defaultValue={branch}
                className="grid grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="labasa"
                    id="r3"
                    className="border-white text-primary"
                  />
                  <Label htmlFor="r3" className="text-white cursor-pointer">
                    Labasa Branch
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="suva"
                    id="r4"
                    className="border-white text-primary"
                  />
                  <Label htmlFor="r4" className="text-white cursor-pointer">
                    Suva Branch
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name" className="text-white">
                Employee Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-white/10 text-white placeholder-gray-400 border-white/20"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="position" className="text-white">
                Employee Position <span className="text-red-500">*</span>
              </Label>
              <Input
                id="position"
                type="text"
                placeholder="e.g., Sales Assistant"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                required
                className="bg-white/10 text-white placeholder-gray-400 border-white/20"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="hourlyWage" className="text-white">
                Hourly Wage ($) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="hourlyWage"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g., 15.50"
                value={hourlyWage}
                onChange={(e) => setHourlyWage(e.target.value)}
                required
                className="bg-white/10 text-white placeholder-gray-400 border-white/20"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tinNo" className="text-white">
                TIN No
              </Label>
              <Input
                id="tinNo"
                type="text"
                placeholder="Enter Tax ID Number"
                value={tinNo}
                onChange={(e) => setTinNo(e.target.value)}
                className="bg-white/10 text-white placeholder-gray-400 border-white/20"
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
                className="border-white text-primary"
              />
              <Label
                htmlFor="fnpfEligible"
                className="text-white cursor-pointer"
              >
                Eligible for FNPF Deduction
              </Label>
            </div>

            {fnpfEligible && (
              <div className="grid gap-2">
                <Label htmlFor="fnpfNo" className="text-white">
                  FNPF No <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fnpfNo"
                  type="text"
                  placeholder="Enter FNPF Number"
                  value={fnpfNo}
                  onChange={(e) => setFnpfNo(e.target.value)}
                  required={fnpfEligible}
                  className="bg-white/10 text-white placeholder-gray-400 border-white/20"
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label className="text-white font-semibold">Payment Method</Label>
              <RadioGroup
                onValueChange={(value) =>
                  setPaymentMethod(value === 'cash' ? 'cash' : 'online')
                }
                defaultValue={paymentMethod}
                className="grid grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="cash"
                    id="r1"
                    className="border-white text-primary"
                  />
                  <Label htmlFor="r1" className="text-white cursor-pointer">
                    Cash Wages
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="online"
                    id="r2"
                    className="border-white text-primary"
                  />
                  <Label htmlFor="r2" className="text-white cursor-pointer">
                    Online Transfer
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {paymentMethod === 'online' && (
              <>
                <div className="grid gap-2 mt-4">
                  <Label htmlFor="bankCode" className="text-white">
                    Bank Code <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    onValueChange={setBankCode}
                    defaultValue={bankCode}
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

                <div className="grid gap-2">
                  <Label htmlFor="bankAccountNumber" className="text-white">
                    Bank Account Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="bankAccountNumber"
                    type="text"
                    placeholder="Enter account number"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    required={paymentMethod === 'online'}
                    className="bg-white/10 text-white placeholder-gray-400 border-white/20"
                  />
                </div>
              </>
            )}

            <Button className="w-full mt-6" type="submit" variant="gradient">
              Create Employee
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateEmployeePage;