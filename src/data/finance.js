const daysAgo = (n) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

export const OPENING_BALANCE = 15000

export const CATEGORIES = ['Salary', 'Freelance', 'Food', 'Shopping', 'Bills', 'Entertainment', 'Transport', 'Other']

export const SEED = [
  { id: 's1',  name: 'Salary',           amount: 4200,  type: 'income',  category: 'Salary',        date: daysAgo(3),   status: 'completed' },
  { id: 's2',  name: 'Netflix',          amount: 15.99, type: 'expense', category: 'Entertainment', date: daysAgo(3),   status: 'completed' },
  { id: 's3',  name: 'Grocery Store',    amount: 84.5,  type: 'expense', category: 'Food',          date: daysAgo(5),   status: 'pending' },
  { id: 's4',  name: 'Freelance Work',   amount: 650,   type: 'income',  category: 'Freelance',     date: daysAgo(7),   status: 'completed' },
  { id: 's5',  name: 'Electricity Bill', amount: 120,   type: 'expense', category: 'Bills',         date: daysAgo(20),  status: 'completed' },
  { id: 's6',  name: 'Salary',           amount: 4200,  type: 'income',  category: 'Salary',        date: daysAgo(33),  status: 'completed' },
  { id: 's7',  name: 'New Shoes',        amount: 210,   type: 'expense', category: 'Shopping',      date: daysAgo(40),  status: 'completed' },
  { id: 's8',  name: 'Uber Rides',       amount: 96,    type: 'expense', category: 'Transport',     date: daysAgo(55),  status: 'completed' },
  { id: 's9',  name: 'Salary',           amount: 4200,  type: 'income',  category: 'Salary',        date: daysAgo(63),  status: 'completed' },
  { id: 's10', name: 'Restaurant',       amount: 140,   type: 'expense', category: 'Food',          date: daysAgo(75),  status: 'completed' },
  { id: 's11', name: 'Internet Bill',    amount: 60,    type: 'expense', category: 'Bills',         date: daysAgo(95),  status: 'completed' },
  { id: 's12', name: 'Headphones',       amount: 320,   type: 'expense', category: 'Shopping',      date: daysAgo(120), status: 'completed' },
  { id: 's13', name: 'Freelance Work',   amount: 900,   type: 'income',  category: 'Freelance',     date: daysAgo(130), status: 'completed' },
  { id: 's14', name: 'Movie Night',      amount: 45,    type: 'expense', category: 'Entertainment', date: daysAgo(155), status: 'completed' },
]
