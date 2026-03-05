import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="300px"
          gap={2}
          p={4}
        >
          <ErrorOutlineIcon sx={{ fontSize: 56, color: '#c62828' }} />
          <Typography variant="h6" fontWeight={600}>
            {this.props.fallbackMessage || 'Something went wrong'}
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            An unexpected error occurred. Please try again.
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={this.handleReset}
            sx={{ mt: 1 }}
          >
            Try Again
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
