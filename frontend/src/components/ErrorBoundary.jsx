import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import React from "react";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can log the error to an error reporting service
        console.error("React ErrorBoundary caught an error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        // Try to navigate to a safe route
        window.location.href = "/";
    };

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <Card title="Something went wrong">
                    <div className="flex flex-col items-center p-4">
                        <div className="text-danger-500 text-4xl mb-2">
                            <Icon icon="heroicons-outline:exclamation-circle" />
                        </div>
                        <h3 className="text-xl font-medium text-slate-900 mb-4">
                            Oops! An error occurred while loading this
                            component.
                        </h3>
                        <p className="text-sm text-slate-600 mb-6">
                            {this.state.error?.message ||
                                "The application encountered an unexpected error."}
                        </p>
                        <div className="flex justify-center">
                            <Button
                                text="Return to Home"
                                icon="heroicons-outline:home"
                                className="btn-danger"
                                onClick={this.handleReset}
                            />
                        </div>
                    </div>
                </Card>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
