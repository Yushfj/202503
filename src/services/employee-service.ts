'use server'; // Keep the server directive

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
  fnpfEligible: boolean; // Added based on usage in create/page.tsx
}

// In a real server component, this data should be stored persistently
// in a database or other server-side storage, not in an in-memory array.
// This in-memory array will reset on every server request/reload.
let employees: Employee[] = [];

// Note: Since this is a server component, data persistence requires
// interaction with a database or file system on the server.
// localStorage is a browser API and cannot be used here.
// The current implementation uses an in-memory array, which is not persistent.


export const getEmployees = async (): Promise<Employee[]> => {
  // In a real application, this would fetch from a database
  return employees;
};

// Use Omit to indicate that the input employee object should not have an 'id'
export const addEmployee = async (employee: Omit<Employee, 'id'>): Promise<void> => {
  // Generate a unique ID for the new employee on the server
  const newEmployeeId = Date.now().toString(); // Simple timestamp ID (consider a more robust UUID in production)

  // Create the new employee object, explicitly setting the generated ID
  const newEmployee: Employee = {
    id: newEmployeeId,
    ...employee, // Spread the rest of the employee data
  };

  employees.push(newEmployee);

  // In a real application, you would save this to a database here
  console.log(`Employee added: ${newEmployee.name} with ID ${newEmployee.id}`);
};

export const updateEmployee = async (updatedEmployee: Employee): Promise<void> => {
  const index = employees.findIndex(emp => emp.id === updatedEmployee.id);
  if (index !== -1) {
    employees[index] = updatedEmployee;
     // In a real application, you would save this update to a database here
    console.log(`Employee updated: ${updatedEmployee.name} with ID ${updatedEmployee.id}`);
  } else {
    console.error(`Employee with id ${updatedEmployee.id} not found for update.`);
    // Optionally throw an error or return a status
  }
};

export const deleteEmployee = async (id: string): Promise<void> => {
  const initialLength = employees.length;
  employees = employees.filter(employee => employee.id !== id);
  if (employees.length < initialLength) {
     // In a real application, you would delete from a database here
     console.log(`Employee with ID ${id} deleted.`);
  } else {
     console.error(`Employee with id ${id} not found for deletion.`);
     // Optionally throw an error or return a status
  }
};
