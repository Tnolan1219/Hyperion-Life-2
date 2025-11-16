import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function PolicyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
        <Card className="glass">
            <CardHeader>
                <CardTitle className="text-3xl text-primary">Privacy Policy</CardTitle>
                <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 prose prose-invert max-w-none text-muted-foreground">
                <p>
                Welcome to Hyperion Life. We are committed to protecting your privacy and handling your data in an open and transparent manner. This privacy policy sets out how we collect, use, and protect any information that you give us when you use this application.
                </p>

                <section>
                    <h2 className="text-xl font-semibold text-foreground">What We Collect</h2>
                    <p>We may collect the following information:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>
                        <strong>Account Information:</strong> When you register, we collect your name, email address, and authentication credentials.
                        </li>
                        <li>
                        <strong>Financial & Life Goal Information:</strong> To provide our services, you may input data related to your finances (assets, debts, income, expenses), life goals, and planning preferences. This data is stored securely and is essential for the app's core functionality.
                        </li>
                        <li>
                        <strong>Usage Data:</strong> We may collect anonymous data about how you interact with our application to help us improve our services.
                        </li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground">How We Use Your Data</h2>
                     <p>We require this information to understand your needs and provide you with a better service, and in particular for the following reasons:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>To power the application's core features, including the Life Plan, AI Coach, and financial calculations.</li>
                        <li>To personalize your experience and provide tailored insights and suggestions.</li>
                        <li>For internal record keeping and service improvement.</li>
                        <li>We will not sell, distribute, or lease your personal information to third parties unless we have your permission or are required by law to do so.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground">Security</h2>
                    <p>
                    We are committed to ensuring that your information is secure. We use Firebase, a Google platform, which provides industry-leading security for data storage and user authentication. All data is encrypted in transit and at rest.
                    </p>
                </section>

                 <section>
                    <h2 className="text-xl font-semibold text-foreground">Cookies</h2>
                    <p>
                    Our application uses necessary cookies for authentication and session management to ensure a secure and seamless user experience. We do not use third-party tracking or advertising cookies.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground">Controlling Your Information</h2>
                    <p>You have control over your personal information. You may delete your account and all associated data at any time from within the application settings.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground">Changes to This Policy</h2>
                    <p>We may update this policy from time to time by updating this page. You should check this page periodically to ensure that you are happy with any changes.</p>
                </section>
            </CardContent>
        </Card>
    </div>
  );
}
