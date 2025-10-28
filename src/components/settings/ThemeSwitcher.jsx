import { useTheme } from '@/contexts/ThemeProvider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Palette } from 'lucide-react';
import { THEMES } from '@/utils/themes';

export function ThemeSwitcher() {
  const { theme, changeTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Palette className="h-4 w-4 mr-2" />
          {THEMES[theme]?.name || 'Theme'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 max-h-64 overflow-y-auto">
        {Object.entries(THEMES).map(([key, themeData]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => changeTheme(key)}
            className={theme === key ? 'bg-accent' : ''}
          >
            {themeData.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}