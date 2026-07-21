export ZSH="$HOME/.oh-my-zsh"
ZSH_THEME="ys"
plugins=(git zsh-autosuggestions zsh-syntax-highlighting)
source $ZSH/oh-my-zsh.sh
alias fb="filebrowser -p 8080 -a 0.0.0.0"
alias pc='ssh gameryotagtagtag@192.168.11.6 -p 2222'
alias pc-r='ssh -R 50022:localhost:8022 gameryotagtagtag@192.168.11.6 -p 2222'
export PATH="SHOME/.local/bin:$PATH"
uptime
