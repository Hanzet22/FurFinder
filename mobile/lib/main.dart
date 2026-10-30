import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'directory_repository.dart';
import 'listing.dart';

void main() => runApp(const FurFinderApp());

class FurFinderApp extends StatelessWidget {
  const FurFinderApp({super.key});

  @override
  Widget build(BuildContext context) => MaterialApp(
        title: 'FurFinder',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          useMaterial3: true,
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF5874E8),
            brightness: Brightness.dark,
          ),
          scaffoldBackgroundColor: const Color(0xFF10131D),
        ),
        home: const ExploreScreen(),
      );
}

class ExploreScreen extends StatefulWidget {
  const ExploreScreen({super.key});
  @override
  State<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends State<ExploreScreen> {
  final _repository = DirectoryRepository();
  final _search = TextEditingController();
  List<Listing> _listings = [];
  bool _loading = true, _offline = false;
  String? _error;
  String _category = 'All', _region = 'Anywhere';
  DateTime? _cachedAt;

  static const _categories = [
    'All', 'community', 'convention', 'artist', 'organization', 'industry', 'resource'
  ];
  static const _regions = [
    'Anywhere', 'North America', 'Europe', 'Asia-Pacific',
    'Latin America', 'Middle East & Africa'
  ];

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _search.dispose();
    _repository.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() { _loading = true; _error = null; _offline = false; });
    try {
      final listings = await _repository.fetchListings();
      if (!mounted) return;
      setState(() { _listings = listings; _loading = false; _cachedAt = DateTime.now(); });
    } catch (_) {
      final cache = await _repository.readCache();
      if (!mounted) return;
      setState(() {
        _loading = false;
        if (cache != null) {
          _listings = cache.listings;
          _cachedAt = cache.savedAt;
          _offline = true;
        } else {
          _error = 'Could not load the directory. Check your connection and try again.';
        }
      });
    }
  }

  List<Listing> get _visible {
    final query = _search.text.trim().toLowerCase();
    return _listings.where((item) {
      final categoryMatch = _category == 'All' || item.category == _category;
      final regionMatch = _region == 'Anywhere' || item.region == _region;
      final text = '${item.name} ${item.summary} ${item.region} ${item.countryCode ?? ''}'.toLowerCase();
      return categoryMatch && regionMatch && (query.isEmpty || text.contains(query));
    }).toList(growable: false);
  }

  @override
  Widget build(BuildContext context) {
    final results = _visible;
    return Scaffold(
      appBar: AppBar(
        title: const Text('furfinder', style: TextStyle(fontWeight: FontWeight.w800)),
        actions: [
          IconButton(
            tooltip: 'Refresh directory',
            onPressed: _loading ? null : _load,
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(18, 8, 18, 32),
          children: [
            Text('THE GLOBAL FURRY DIRECTORY',
                style: Theme.of(context).textTheme.labelMedium?.copyWith(
                  color: Theme.of(context).colorScheme.primary,
                  letterSpacing: 1.4, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            Text('Discover your\ncommunity.',
                style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                  fontWeight: FontWeight.w800, height: 1.05)),
            const SizedBox(height: 10),
            Text('Explore public communities, conventions, creators and organizations around the world.',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: Colors.white70)),
            const SizedBox(height: 22),
            TextField(
              controller: _search,
              onChanged: (_) => setState(() {}),
              decoration: InputDecoration(
                hintText: 'Search the directory',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _search.text.isEmpty ? null : IconButton(
                  tooltip: 'Clear search',
                  onPressed: () { _search.clear(); setState(() {}); },
                  icon: const Icon(Icons.close)),
                filled: true,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 12),
            Row(children: [
              Expanded(child: _filter('Category', _category, _categories,
                  (value) => setState(() => _category = value))),
              const SizedBox(width: 10),
              Expanded(child: _filter('Region', _region, _regions,
                  (value) => setState(() => _region = value))),
            ]),
            if (_offline) _notice('Offline mode · showing saved public listings'),
            if (_loading)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 48),
                child: Center(child: CircularProgressIndicator()),
              )
            else if (_error != null)
              _state(Icons.wifi_off, _error!, action: 'Retry', onPressed: _load)
            else if (results.isEmpty)
              _state(Icons.search_off, _listings.isEmpty
                  ? 'No published listings are available yet.'
                  : 'No listings match these filters.')
            else ...[
              const SizedBox(height: 24),
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                Text('PUBLIC LISTINGS', style: Theme.of(context).textTheme.labelMedium?.copyWith(letterSpacing: 1.2)),
                Text('${results.length} found', style: Theme.of(context).textTheme.labelMedium),
              ]),
              const SizedBox(height: 12),
              for (final listing in results)
                Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(18),
                    onTap: () => Navigator.of(context).push(MaterialPageRoute(
                      builder: (_) => ListingDetailScreen(listing: listing))),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Row(children: [
                          _tag(listing.category),
                          const Spacer(),
                          Flexible(child: Text(listing.region, overflow: TextOverflow.ellipsis,
                              style: Theme.of(context).textTheme.labelSmall?.copyWith(color: Colors.white60))),
                        ]),
                        const SizedBox(height: 12),
                        Text(listing.name, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 6),
                        Text(listing.summary, maxLines: 3, overflow: TextOverflow.ellipsis,
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.white70)),
                        const SizedBox(height: 12),
                        Row(children: [
                          Text('View details', style: TextStyle(
                            color: Theme.of(context).colorScheme.primary, fontWeight: FontWeight.w600)),
                          const SizedBox(width: 5),
                          const Icon(Icons.arrow_forward, size: 15),
                        ]),
                      ]),
                    ),
                  ),
                ),
            ],
            if (_cachedAt != null && _offline)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Text('Saved: ${_cachedAt!.toLocal()}',
                    style: Theme.of(context).textTheme.labelSmall?.copyWith(color: Colors.white54))),
            const SizedBox(height: 12),
            Text('Discover openly. Respect communities. Verify sources.',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.labelSmall?.copyWith(color: Colors.white54)),
          ],
        ),
      ),
    );
  }

  Widget _filter(String label, String value, List<String> options, ValueChanged<String> onChanged) =>
      DropdownButtonFormField<String>(
        initialValue: value,
        isExpanded: true,
        decoration: InputDecoration(
          labelText: label, filled: true,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(14))),
        items: options.map((option) => DropdownMenuItem(
          value: option,
          child: Text(option == 'All' || option == 'Anywhere'
              ? option : option[0].toUpperCase() + option.substring(1),
              overflow: TextOverflow.ellipsis),
        )).toList(),
        onChanged: (next) { if (next != null) onChanged(next); },
      );

  Widget _tag(String text) => DecoratedBox(
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.primaryContainer,
          borderRadius: BorderRadius.circular(20)),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          child: Text(text.toUpperCase(),
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                color: Theme.of(context).colorScheme.onPrimaryContainer,
                fontWeight: FontWeight.bold))),
      );

  Widget _notice(String message) => Container(
        margin: const EdgeInsets.only(top: 14),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.amber.withValues(alpha: .12),
          borderRadius: BorderRadius.circular(12)),
        child: Row(children: [
          const Icon(Icons.cloud_off, size: 18),
          const SizedBox(width: 8),
          Expanded(child: Text(message)),
        ]),
      );

  Widget _state(IconData icon, String message, {String? action, VoidCallback? onPressed}) =>
      Padding(
        padding: const EdgeInsets.symmetric(vertical: 46),
        child: Column(children: [
          Icon(icon, size: 34, color: Colors.white54),
          const SizedBox(height: 12),
          Text(message, textAlign: TextAlign.center),
          if (action != null) ...[
            const SizedBox(height: 14),
            FilledButton(onPressed: onPressed, child: Text(action)),
          ],
        ]),
      );
}

class ListingDetailScreen extends StatelessWidget {
  const ListingDetailScreen({super.key, required this.listing});
  final Listing listing;

  Future<void> _open(BuildContext context, String value) async {
    final uri = Uri.tryParse(value);
    if (uri == null || uri.scheme != 'https' || uri.host.isEmpty) return;
    final opened = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!opened && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not open this link.')));
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('Listing details')),
        body: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Text(listing.category.toUpperCase(),
                style: Theme.of(context).textTheme.labelMedium?.copyWith(
                  color: Theme.of(context).colorScheme.primary, letterSpacing: 1.3)),
            const SizedBox(height: 10),
            Text(listing.name, style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Text(listing.summary, style: Theme.of(context).textTheme.bodyLarge),
            const SizedBox(height: 22),
            _detailRow(context, 'Region', listing.region),
            if (listing.countryCode != null) _detailRow(context, 'Country code', listing.countryCode!),
            _detailRow(context, 'Verification date', listing.verifiedAt ?? 'Not provided'),
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: () => _open(context, listing.websiteUrl),
              icon: const Icon(Icons.open_in_new), label: const Text('Official website')),
            OutlinedButton.icon(
              onPressed: () => _open(context, listing.sourceUrl),
              icon: const Icon(Icons.fact_check_outlined), label: const Text('View information source')),
            const SizedBox(height: 18),
            Text('Only public links are shown. Check listing information against its source.',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.white60)),
          ],
        ),
      );

  Widget _detailRow(BuildContext context, String label, String value) => Padding(
        padding: const EdgeInsets.only(bottom: 14),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(label, style: Theme.of(context).textTheme.labelMedium?.copyWith(color: Colors.white54)),
          const SizedBox(height: 4),
          Text(value, style: Theme.of(context).textTheme.bodyLarge),
        ]),
      );
}
