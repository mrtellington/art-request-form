/**
 * Home Page
 *
 * Landing page that redirects to the main request form.
 */

import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/request');
}
