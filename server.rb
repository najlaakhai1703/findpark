require 'webrick'

root = File.expand_path(File.dirname(__FILE__))
port = 8080

server = WEBrick::HTTPServer.new(
  :Port => port,
  :DocumentRoot => root,
  :AccessLog => [],
  :Logger => WEBrick::Log.new(nil, WEBrick::Log::WARN)
)

trap('INT') { server.shutdown }
trap('TERM') { server.shutdown }

puts "FindPark Server berjalan di http://localhost:#{port}"
server.start
