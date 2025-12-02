'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/Card';
import { ResponsiveContainer } from '@/components/layout/ResponsiveContainer';
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid';

/**
 * ThemeExample - Demonstrates the theme system implementation
 *
 * This component showcases:
 * - Requirement 18.4: Minimal padding and gaps for space efficiency
 * - Requirement 18.5: Responsive layouts optimized for touch interaction
 * - Requirement 18.6: Minimal clicks to complete tasks
 */
export function ThemeExample() {
  return (
    <ResponsiveContainer spacing="compact">
      <div className="space-y-compact">
        <h1 className="text-2xl font-bold text-foreground">Theme System Example</h1>
        <p className="text-muted-foreground">
          Demonstrating minimal spacing, responsive design, and touch-friendly interactions
        </p>

        {/* Spacing Examples */}
        <Card padding="compact">
          <CardHeader>
            <CardTitle>Minimal Spacing (Requirement 18.4)</CardTitle>
            <CardDescription>
              Components use compact spacing by default for space efficiency
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-tight">
              <div className="p-tight bg-accent rounded">Tight spacing (4px)</div>
              <div className="p-compact bg-accent rounded">Compact spacing (8px)</div>
              <div className="p-cozy bg-accent rounded">Cozy spacing (12px)</div>
            </div>
          </CardContent>
        </Card>

        {/* Form Components */}
        <Card padding="compact">
          <CardHeader>
            <CardTitle>Touch-Friendly Forms (Requirement 18.5)</CardTitle>
            <CardDescription>
              All form inputs are optimized for touch devices with minimum 44px targets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-compact">
              <Input label="Email" placeholder="Enter your email" />
              <Select
                label="Role"
                options={[
                  { value: 'admin', label: 'Admin' },
                  { value: 'developer', label: 'Developer' },
                  { value: 'auditor', label: 'Auditor' },
                ]}
              />
              <Textarea label="Description" placeholder="Enter description" />
              <Checkbox label="I agree to the terms and conditions" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Submit</Button>
            <Button variant="outline">Cancel</Button>
          </CardFooter>
        </Card>

        {/* Responsive Grid */}
        <Card padding="compact">
          <CardHeader>
            <CardTitle>Responsive Grid (Requirement 18.5)</CardTitle>
            <CardDescription>
              Grid adapts to screen size: 1 column on mobile, 2 on tablet, 3 on desktop
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveGrid cols={{ default: 1, md: 2, lg: 3 }} gap="compact">
              <div className="p-compact bg-accent rounded">Item 1</div>
              <div className="p-compact bg-accent rounded">Item 2</div>
              <div className="p-compact bg-accent rounded">Item 3</div>
              <div className="p-compact bg-accent rounded">Item 4</div>
              <div className="p-compact bg-accent rounded">Item 5</div>
              <div className="p-compact bg-accent rounded">Item 6</div>
            </ResponsiveGrid>
          </CardContent>
        </Card>

        {/* Interactive Cards */}
        <Card padding="compact">
          <CardHeader>
            <CardTitle>Quick Actions (Requirement 18.6)</CardTitle>
            <CardDescription>
              Interactive cards reduce clicks - click anywhere to perform action
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveGrid cols={{ default: 1, md: 2 }} gap="compact">
              <Card interactive padding="compact" onClick={() => alert('Task clicked!')}>
                <CardHeader>
                  <CardTitle>Task #1</CardTitle>
                  <CardDescription>Click anywhere on this card</CardDescription>
                </CardHeader>
              </Card>
              <Card interactive padding="compact" onClick={() => alert('Task clicked!')}>
                <CardHeader>
                  <CardTitle>Task #2</CardTitle>
                  <CardDescription>Click anywhere on this card</CardDescription>
                </CardHeader>
              </Card>
            </ResponsiveGrid>
          </CardContent>
        </Card>

        {/* Button Variants */}
        <Card padding="compact">
          <CardHeader>
            <CardTitle>Button Variants</CardTitle>
            <CardDescription>
              All buttons include active states and touch optimization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-compact">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
              <Button size="icon">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M12 4v16m8-8H4" />
                </svg>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ResponsiveContainer>
  );
}
