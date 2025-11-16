import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Map, Brain, Wallet, Zap } from "lucide-react";

const principles = [
    {
        icon: Map,
        title: "Holistic Life Design",
        description: "We believe your finances are not separate from your life's ambitions. Hyperion Life is built to integrate your career, personal milestones, and financial goals into a single, cohesive strategy."
    },
    {
        icon: Brain,
        title: "AI as a Co-Pilot",
        description: "Our intelligent AI coach is more than a chatbot. It's your personal strategist, helping you navigate complex decisions, simulate futures, and stay on track with personalized insights."
    },
    {
        icon: Wallet,
        title: "Clarity Through Visualization",
        description: "Complex financial data becomes intuitive and actionable through our visual tools. We empower you to see the big picture, understand the trade-offs, and make decisions with confidence."
    },
    {
        icon: Zap,
        title: "From Reactive to Proactive",
        description: "Stop reacting to your financial situation. Hyperion Life helps you get ahead of the curve, turning you from a passive budgeter into the proactive architect of your own destiny."
    }
]

export default function AboutPage() {
  return (
    <div className="space-y-12">
        <div className="text-center pt-12">
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary leading-tight">Chart Your Destiny</h1>
            <p className="mt-4 text-xl max-w-3xl mx-auto text-muted-foreground">
                At Hyperion Life, we believe you are the architect of your future. We're building more than a financial tool—we're creating a co-pilot for your life's journey.
            </p>
        </div>

        <div className="max-w-5xl mx-auto">
            <Card className="glass">
                <CardHeader>
                    <CardTitle className="text-2xl">Our Vision: Beyond Budgeting</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground text-lg">
                    <p>For too long, personal finance has been about restriction. About cutting back. About saying "no." It's been a game of defense, focused on spreadsheets and scarcity.</p>
                    <p>We see a different path. A future where financial planning is an act of creation—an offensive strategy for achieving your most ambitious goals. It’s not just about managing money; it’s about deploying capital to build the life you envision. Whether that means launching a business, achieving financial independence, or creating a lasting legacy, Hyperion Life provides the strategic framework.</p>
                    <p className="font-semibold text-foreground">Our mission is to give you the clarity and confidence to make bold decisions, navigate trade-offs, and build a future with intention.</p>
                </CardContent>
            </Card>
        </div>
        
        <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">The Hyperion Method</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {principles.map(p => (
                     <Card key={p.title} className="glass hover:border-primary/50 transition-all">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <p.icon className="h-6 w-6" />
                            </div>
                            <CardTitle>{p.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{p.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    </div>
  );
}
