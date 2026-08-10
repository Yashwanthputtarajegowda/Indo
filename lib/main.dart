import 'package:flutter/material.dart';

void main() {
  runApp(const IndoApp());
}

class IndoApp extends StatelessWidget {
  const IndoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Indo',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF090A12),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF8B5CF6),
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
      ),
      home: const SplashScreen(),
    );
  }
}

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(milliseconds: 1200), () {
      if (mounted) Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const AuthScreen()));
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 82,
              height: 82,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(24),
                gradient: const LinearGradient(colors: [Color(0xFF8B5CF6), Color(0xFFEC4899)]),
              ),
              child: const Icon(Icons.bolt_rounded, size: 48),
            ),
            const SizedBox(height: 18),
            const Text('Indo', style: TextStyle(fontSize: 36, fontWeight: FontWeight.w800)),
            const SizedBox(height: 6),
            Text('Share. Connect. Inspire.', style: TextStyle(color: Colors.white.withOpacity(.6))),
          ],
        ),
      ),
    );
  }
}

class AuthScreen extends StatelessWidget {
  const AuthScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final email = TextEditingController();
    final password = TextEditingController();
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Align(alignment: Alignment.centerLeft, child: Text('Welcome to Indo', style: TextStyle(fontSize: 30, fontWeight: FontWeight.w800))),
              const SizedBox(height: 8),
              Align(alignment: Alignment.centerLeft, child: Text('Your people. Your stories. Your space.', style: TextStyle(color: Colors.white.withOpacity(.55)))),
              const SizedBox(height: 32),
              TextField(controller: email, keyboardType: TextInputType.emailAddress, decoration: const InputDecoration(labelText: 'Email', prefixIcon: Icon(Icons.mail_outline), border: OutlineInputBorder())),
              const SizedBox(height: 14),
              TextField(controller: password, obscureText: true, decoration: const InputDecoration(labelText: 'Password', prefixIcon: Icon(Icons.lock_outline), border: OutlineInputBorder())),
              const SizedBox(height: 20),
              SizedBox(width: double.infinity, height: 52, child: FilledButton(onPressed: () => Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const HomeScreen())), child: const Text('Continue'))),
              const SizedBox(height: 14),
              TextButton(onPressed: () {}, child: const Text('Create new account')),
            ],
          ),
        ),
      ),
    );
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int index = 0;

  final pages = const [FeedPage(), SearchPage(), CreatePage(), MessagesPage(), ProfilePage()];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: pages[index],
      bottomNavigationBar: NavigationBar(
        selectedIndex: index,
        onDestinationSelected: (value) => setState(() => index = value),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.search), label: 'Search'),
          NavigationDestination(icon: Icon(Icons.add_box_outlined), selectedIcon: Icon(Icons.add_box), label: 'Create'),
          NavigationDestination(icon: Icon(Icons.chat_bubble_outline), selectedIcon: Icon(Icons.chat_bubble), label: 'Chat'),
          NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}

class FeedPage extends StatelessWidget {
  const FeedPage({super.key});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: CustomScrollView(
        slivers: [
          SliverAppBar(
            floating: true,
            title: const Text('Indo', style: TextStyle(fontWeight: FontWeight.w900)),
            actions: [IconButton(onPressed: () {}, icon: const Icon(Icons.notifications_none)), IconButton(onPressed: () {}, icon: const Icon(Icons.tune))],
          ),
          SliverToBoxAdapter(child: _stories()),
          SliverList(delegate: SliverChildBuilderDelegate((context, i) => const PostCard(), childCount: 4)),
        ],
      ),
    );
  }

  Widget _stories() => SizedBox(
        height: 116,
        child: ListView.builder(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          scrollDirection: Axis.horizontal,
          itemCount: 8,
          itemBuilder: (_, i) => Padding(
            padding: const EdgeInsets.only(right: 14),
            child: Column(children: [
              Container(width: 64, height: 64, padding: const EdgeInsets.all(3), decoration: BoxDecoration(shape: BoxShape.circle, gradient: const LinearGradient(colors: [Color(0xFF8B5CF6), Color(0xFFEC4899)])), child: const CircleAvatar(backgroundColor: Color(0xFF171827), child: Icon(Icons.person))),
              const SizedBox(height: 7),
              Text(i == 0 ? 'Your story' : 'user$i', style: const TextStyle(fontSize: 11)),
            ]),
          ),
        ),
      );
}

class PostCard extends StatefulWidget {
  const PostCard({super.key});

  @override
  State<PostCard> createState() => _PostCardState();
}

class _PostCardState extends State<PostCard> {
  bool liked = false;
  int likes = 128;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.fromLTRB(12, 6, 12, 10),
      clipBehavior: Clip.antiAlias,
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        ListTile(leading: const CircleAvatar(child: Icon(Icons.person)), title: const Text('Indo Creator', style: TextStyle(fontWeight: FontWeight.w700)), subtitle: const Text('@indocreator • 2h'), trailing: IconButton(onPressed: () {}, icon: const Icon(Icons.more_horiz))),
        Container(height: 280, decoration: const BoxDecoration(gradient: LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: [Color(0xFF21183F), Color(0xFF5B1E56), Color(0xFF101B38)])), child: const Center(child: Icon(Icons.image_outlined, size: 64, color: Colors.white54))),
        Padding(padding: const EdgeInsets.fromLTRB(12, 8, 12, 4), child: Row(children: [IconButton(onPressed: () => setState(() { liked = !liked; likes += liked ? 1 : -1; }), icon: Icon(liked ? Icons.favorite : Icons.favorite_border, color: liked ? Colors.pinkAccent : null)), IconButton(onPressed: () {}, icon: const Icon(Icons.mode_comment_outlined)), IconButton(onPressed: () {}, icon: const Icon(Icons.send_outlined)), const Spacer(), IconButton(onPressed: () {}, icon: const Icon(Icons.bookmark_border))])),
        Padding(padding: const EdgeInsets.symmetric(horizontal: 16), child: Text('$likes likes', style: const TextStyle(fontWeight: FontWeight.w700))),
        const Padding(padding: EdgeInsets.fromLTRB(16, 5, 16, 14), child: Text('Building something new with the Indo community ✨ #indo', style: TextStyle(height: 1.35))),
      ]),
    );
  }
}

class SearchPage extends StatelessWidget {
  const SearchPage({super.key});
  @override
  Widget build(BuildContext context) => SafeArea(child: Padding(padding: const EdgeInsets.all(16), child: Column(children: [TextField(decoration: InputDecoration(hintText: 'Search people, posts and tags', prefixIcon: const Icon(Icons.search), filled: true, border: OutlineInputBorder(borderRadius: BorderRadius.circular(18), borderSide: BorderSide.none))), const SizedBox(height: 24), const Align(alignment: Alignment.centerLeft, child: Text('Discover people', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800))), const SizedBox(height: 14), ...List.generate(5, (i) => ListTile(leading: const CircleAvatar(child: Icon(Icons.person)), title: Text('Creator $i'), subtitle: Text('@creator$i'), trailing: FilledButton.tonal(onPressed: () {}, child: const Text('Follow'))))])));
}

class CreatePage extends StatelessWidget {
  const CreatePage({super.key});
  @override
  Widget build(BuildContext context) => SafeArea(child: Padding(padding: const EdgeInsets.all(20), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [const Text('Create', style: TextStyle(fontSize: 30, fontWeight: FontWeight.w800)), const SizedBox(height: 24), TextField(maxLines: 5, decoration: InputDecoration(hintText: 'What do you want to share?', filled: true, border: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: BorderSide.none))), const SizedBox(height: 16), Row(children: [Expanded(child: FilledButton.tonalIcon(onPressed: () {}, icon: const Icon(Icons.photo_library_outlined), label: const Text('Photo / Video'))), const SizedBox(width: 12), Expanded(child: FilledButton(onPressed: () {}, child: const Text('Post')))])])));
}

class MessagesPage extends StatelessWidget {
  const MessagesPage({super.key});
  @override
  Widget build(BuildContext context) => SafeArea(child: ListView(padding: const EdgeInsets.all(16), children: [const Text('Messages', style: TextStyle(fontSize: 30, fontWeight: FontWeight.w800)), const SizedBox(height: 20), ...List.generate(8, (i) => ListTile(contentPadding: const EdgeInsets.symmetric(vertical: 4), leading: const CircleAvatar(child: Icon(Icons.person)), title: Text('Indo User $i', style: const TextStyle(fontWeight: FontWeight.w700)), subtitle: const Text('Tap to start a conversation'), trailing: const Icon(Icons.chevron_right))) ]));
}

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});
  @override
  Widget build(BuildContext context) => SafeArea(child: ListView(padding: const EdgeInsets.all(20), children: [Row(children: [const CircleAvatar(radius: 42, child: Icon(Icons.person, size: 42)), const SizedBox(width: 20), Expanded(child: Row(mainAxisAlignment: MainAxisAlignment.spaceAround, children: [const _Stat('120', 'Posts'), const _Stat('2.4K', 'Followers'), const _Stat('320', 'Following')]))]), const SizedBox(height: 18), const Text('Your Name', style: TextStyle(fontSize: 21, fontWeight: FontWeight.w800)), const Text('@username', style: TextStyle(color: Colors.white54)), const SizedBox(height: 10), const Text('Welcome to my Indo profile. Share. Connect. Inspire.'), const SizedBox(height: 20), FilledButton.tonal(onPressed: () {}, child: const Text('Edit profile')), const SizedBox(height: 24), const Divider(), const SizedBox(height: 12), const Text('Posts', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)), const SizedBox(height: 12), GridView.builder(shrinkWrap: true, physics: const NeverScrollableScrollPhysics(), itemCount: 9, gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 3, crossAxisSpacing: 5, mainAxisSpacing: 5), itemBuilder: (_, __) => Container(color: const Color(0xFF171827), child: const Icon(Icons.image_outlined, color: Colors.white38))) ]));
}

class _Stat extends StatelessWidget {
  final String value;
  final String label;
  const _Stat(this.value, this.label);
  @override
  Widget build(BuildContext context) => Column(children: [Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)), Text(label, style: const TextStyle(color: Colors.white54, fontSize: 12))]);
}
