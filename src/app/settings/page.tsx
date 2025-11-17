'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useAuth } from '@/firebase/provider';
import { doc } from 'firebase/firestore';
import { useTheme } from 'next-themes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User as UserIcon, LogOut, CheckCircle, TrendingUp, Calendar, Trash2, Moon, Sun, Monitor } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';


type UserProfile = {
    name: string;
    age: number;
    careerStage: string;
    income: string;
};

type UserPreferences = {
    lifeGoals: string[];
    planningPreferences: string[];
    onboardingComplete: boolean;
};

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  age: z.coerce.number().min(1, "Age is required."),
  careerStage: z.string().min(1, "Career stage is required."),
  income: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>;

const StatCard = ({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

const EditProfileTab = ({ profile, userId }: { profile: UserProfile, userId: string }) => {
    const firestore = useFirestore();

    const form = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        values: {
            name: profile.name,
            age: profile.age,
            careerStage: profile.careerStage,
            income: profile.income,
        }
    });

    const onSubmit = (data: ProfileFormData) => {
        if (!firestore || !userId) return;
        const profileRef = doc(firestore, `users/${userId}/profiles`, userId);
        updateDocumentNonBlocking(profileRef, data);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Edit Your Profile</CardTitle>
                <CardDescription>Keep your personal information up to date.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="age"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Age</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="careerStage"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Career Stage</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="student">Student</SelectItem>
                                            <SelectItem value="early-career">Early Career</SelectItem>
                                            <SelectItem value="mid-career">Mid Career</SelectItem>
                                            <SelectItem value="late-career">Late Career</SelectItem>
                                            <SelectItem value="retired">Retired</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="income"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Income Range (Optional)</FormLabel>
                                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="0-50k">$0 - $50,000</SelectItem>
                                            <SelectItem value="50k-100k">$50,001 - $100,000</SelectItem>
                                            <SelectItem value="100k-200k">$100,001 - $200,000</SelectItem>
                                            <SelectItem value="200k+">$200,001+</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">Save Changes</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

const SettingsTab = () => {
    const { setTheme } = useTheme();
    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Display</CardTitle>
                    <CardDescription>Customize the look and feel of the application.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label>Theme</Label>
                        <div className="flex space-x-2">
                            <Button variant="outline" onClick={() => setTheme('light')}><Sun className="mr-2 h-4 w-4" /> Light</Button>
                            <Button variant="outline" onClick={() => setTheme('dark')}><Moon className="mr-2 h-4 w-4" /> Dark</Button>
                            <Button variant="outline" onClick={() => setTheme('system')}><Monitor className="mr-2 h-4 w-4" /> System</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Manage your notification preferences.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Notification settings are coming soon.</p>
                </CardContent>
            </Card>
        </div>
    )
}

const AccountTab = () => {
    const auth = useAuth();
    return (
         <Card>
            <CardHeader>
                <CardTitle className="text-destructive">Account Management</CardTitle>
                <CardDescription>Manage your account and data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button variant="destructive" className="w-full sm:w-auto">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                </Button>
                 <p className="text-sm text-muted-foreground">This action is irreversible and will permanently delete all your data.</p>
                <Button variant="outline" className="w-full sm:w-auto" onClick={() => auth.signOut()}>
                    <LogOut className="mr-2 h-4 w-4" /> Log Out
                </Button>
            </CardContent>
        </Card>
    )
}

const OverviewTab = ({ user, profile, preferences, isLoading }: { user: any, profile: UserProfile | null, preferences: UserPreferences | null, isLoading: boolean }) => (
    <div className="space-y-8">
        <Card className="glass">
            <CardHeader>
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary">
                        <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || ''} />
                        <AvatarFallback><UserIcon className="h-8 w-8" /></AvatarFallback>
                    </Avatar>
                    <div>
                        {isLoading ? <Skeleton className="h-8 w-48 mb-2" /> : <CardTitle className="text-3xl">{profile?.name || user?.displayName}</CardTitle>}
                        {isLoading ? <Skeleton className="h-5 w-64" /> : <CardDescription>{user?.email}</CardDescription>}
                    </div>
                </div>
            </CardHeader>
             <CardContent>
                 {isLoading ? (
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
                     </div>
                 ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard title="Goals in Progress" value={5} icon={CheckCircle} />
                        <StatCard title="Net Worth Growth" value="+3.2%" icon={TrendingUp} />
                        <StatCard title="Member Since" value={user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'} icon={Calendar} />
                        <StatCard title="AI Persona" value="Active" icon={UserIcon} />
                    </div>
                 )}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Your Life Goals</CardTitle>
                <CardDescription>These are the primary ambitions you're working towards.</CardDescription>
            </CardHeader>
            <CardContent>
                 {isLoading ? <Skeleton className="h-20 w-full" /> : (
                     <div className="flex flex-wrap gap-2">
                        {preferences?.lifeGoals?.map(goal => <Badge key={goal} variant="secondary" className="text-base py-1 px-3">{goal}</Badge>)}
                    </div>
                 )}
            </CardContent>
        </Card>
    </div>
);


export default function SettingsPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    
    const profileRef = useMemoFirebase(() => user ? doc(firestore, `users/${user.uid}/profiles/${user.uid}`) : null, [user, firestore]);
    const preferencesRef = useMemoFirebase(() => user ? doc(firestore, `users/${user.uid}/preferences/${user.uid}`) : null, [user, firestore]);
    
    const { data: profile, isLoading: isProfileLoading } = useDoc<UserProfile>(profileRef);
    const { data: preferences, isLoading: isPreferencesLoading } = useDoc<UserPreferences>(preferencesRef);
    
    const isLoading = isUserLoading || isProfileLoading || isPreferencesLoading;

    return (
        <div className="space-y-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-primary">Profile & Settings</h1>
                <p className="text-muted-foreground mt-2">
                Manage your profile, preferences, and account settings.
                </p>
            </div>
            
            <Tabs defaultValue="overview" className="w-full">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="edit-profile">Edit Profile</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                     <TabsTrigger value="account">Account</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="mt-6">
                    <OverviewTab user={user} profile={profile} preferences={preferences} isLoading={isLoading} />
                </TabsContent>
                <TabsContent value="edit-profile" className="mt-6">
                    {profile && user && <EditProfileTab profile={profile} userId={user.uid} />}
                </TabsContent>
                <TabsContent value="settings" className="mt-6">
                    <SettingsTab />
                </TabsContent>
                <TabsContent value="account" className="mt-6">
                    <AccountTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
