import { redirect } from 'next/navigation'

export default function Page() {
  // Redirect root to the login page
  redirect('/login')
}
